export interface CampRenderSettings {
    renderOutlines: boolean;
    renderSlots: boolean;
    renderObjects: boolean;
    depth: number;
}

export const campRenderSettings: CampRenderSettings = {
    renderOutlines: false,
    renderSlots: false,
    renderObjects: false,
    depth: 0,
};
