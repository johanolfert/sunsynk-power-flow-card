// Home Assistant owns the outer edit dialog. Keep this override instance-scoped.
const activeDialogs = new WeakMap<HTMLElement, {
	users: number;
	style: HTMLStyleElement;
	attribute: string | null;
	previewWidth: string;
	previewPriority: string;
}>();

export function widenEditorDialog(editor: HTMLElement): () => void {
	let node: Node | null = editor;
	let dialog: HTMLElement | undefined;
	while (node) {
		if (node instanceof HTMLElement && node.localName === 'hui-dialog-edit-card') {
			dialog = node;
			break;
		}
		node = node.parentNode || (node instanceof ShadowRoot ? node.host : null);
	}
	const root = dialog?.shadowRoot;
	if (!dialog || !root) return () => {};

	const existing = activeDialogs.get(dialog);
	if (existing) {
		existing.users++;
	} else {
		const preview = root.querySelector<HTMLElement>('.element-preview');
		const width = Math.max(500, preview?.offsetWidth || 0);
		const style = document.createElement('style');
		style.textContent = `
			@media (min-width: 1300px) and (min-height: 501px) {
				:host([data-sunsynk-wide-editor]) ha-dialog {
					--mdc-dialog-max-width: 96vw;
					--ha-dialog-width-lg: min(1548px, 96vw);
					--ha-dialog-width-full: min(1548px, 96vw);
				}
				:host([data-sunsynk-wide-editor]) .content {
					width: min(1500px, calc(96vw - 48px));
					max-width: none;
				}
				:host([data-sunsynk-wide-editor]) .content > .element-editor {
					flex: 1 1 0;
					min-width: 0;
				}
				:host([data-sunsynk-wide-editor]) .content > .element-preview {
					flex: 0 0 var(--sunsynk-editor-preview-width);
					min-width: 0;
					box-sizing: border-box;
				}
			}
		`;
		activeDialogs.set(dialog, {
			users: 1,
			style,
			attribute: dialog.getAttribute('data-sunsynk-wide-editor'),
			previewWidth: dialog.style.getPropertyValue('--sunsynk-editor-preview-width'),
			previewPriority: dialog.style.getPropertyPriority('--sunsynk-editor-preview-width'),
		});
		dialog.setAttribute('data-sunsynk-wide-editor', '');
		dialog.style.setProperty('--sunsynk-editor-preview-width', `${width}px`);
		root.appendChild(style);
	}

	const owner = dialog;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		const state = activeDialogs.get(owner);
		if (!state || --state.users > 0) return;
		state.style.remove();
		if (state.attribute === null) owner.removeAttribute('data-sunsynk-wide-editor');
		else owner.setAttribute('data-sunsynk-wide-editor', state.attribute);
		if (state.previewWidth) {
			owner.style.setProperty('--sunsynk-editor-preview-width', state.previewWidth, state.previewPriority);
		} else {
			owner.style.removeProperty('--sunsynk-editor-preview-width');
		}
		activeDialogs.delete(owner);
	};
}
