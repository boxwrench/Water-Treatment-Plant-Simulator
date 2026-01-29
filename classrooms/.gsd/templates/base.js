/*
  Water Treatment Operator Digital Classroom/**
 * SCADA-Grade Global Utilities
 * Focused on 100 MGD Scaling and Physical Fidelity
 */

const HYDRAULICS = {
    TOTAL_PLANT_MGD: 100,
    TRAINS: 14,
    MGD_TO_GPM: 694.44,
    GPM_TO_CFS: 0.002228,
    FT3_TO_GAL: 7.48,

    getTrainFlowGPM(totalMGD) {
        return (totalMGD / this.TRAINS) * this.MGD_TO_GPM;
    },

    getDetentionTimeMin(volumeGal, flowGPM) {
        return volumeGal / flowGPM;
    },

    getSOR(flowGPM, areaSQFT) {
        return (flowGPM * 1440) / areaSQFT; // GPD/sqft
    }
};

const PHYSICS = {
    viscosity(tempC) {
        return 0.00002414 * Math.pow(10, 247.8 / (tempC + 133.15));
    },

    calculateG(powerWatts, viscosity, volumeM3) {
        return Math.sqrt(powerWatts / (viscosity * volumeM3));
    }
};

const UI = {
    formatData(value, decimals = 2) {
        return Number(value).toFixed(decimals);
    },

    updateAlarm(id, active, message) {
        const el = document.getElementById(id);
        if (el) {
function handleWindowResized(p, parentId) {
    const parent = document.getElementById(parentId);
    p.resizeCanvas(parent.clientWidth, parent.clientHeight);
}
