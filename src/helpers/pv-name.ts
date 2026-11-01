import { CardStyle, InverterModel, sunsynkPowerFlowCardConfig } from '../types';

export const PV_NAME_MAX_LENGTH = 12;

export const hasLimitedPVNames = (config: sunsynkPowerFlowCardConfig): boolean =>
	(config.cardstyle ?? CardStyle.Full) === CardStyle.Full &&
	config.inverter?.model === InverterModel.Outback &&
	config.solar?.mppts === 2;

export const limitPVName = (name: string): string =>
	Array.from(name).slice(0, PV_NAME_MAX_LENGTH).join('');
