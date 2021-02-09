/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
