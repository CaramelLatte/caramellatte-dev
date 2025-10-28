import { useEffect, useRef } from 'react';

const KEYBOARD_ACTIONS = {
    ARROW_UP: { key: 'ArrowUp', code: 'ArrowUp' },
    ARROW_DOWN: { key: 'ArrowDown', code: 'ArrowDown' },
    ARROW_LEFT: { key: 'ArrowLeft', code: 'ArrowLeft' },
    ARROW_RIGHT: { key: 'ArrowRight', code: 'ArrowRight' },
    BUTTON_A: { key: 'x', code: 'KeyX' },
    BUTTON_B: { key: 'z', code: 'KeyZ' },
    BUTTON_X: { key: 'a', code: 'KeyA' },
    BUTTON_Y: { key: 's', code: 'KeyS' },
    SHOULDER_LEFT: { key: 'q', code: 'KeyQ' },
    SHOULDER_RIGHT: { key: 'w', code: 'KeyW' },
    START: { key: 'Enter', code: 'Enter' },
    SELECT: { key: 'Shift', code: 'ShiftLeft' }
};

const BUTTON_BINDINGS = {
    0: 'BUTTON_A',
    1: 'BUTTON_B',
    2: 'BUTTON_X',
    3: 'BUTTON_Y',
    4: 'SHOULDER_LEFT',
    5: 'SHOULDER_RIGHT',
    8: 'SELECT',
    9: 'START',
    12: 'ARROW_UP',
    13: 'ARROW_DOWN',
    14: 'ARROW_LEFT',
    15: 'ARROW_RIGHT'
};

const AXIS_BINDINGS = [
    { axis: 0, negative: 'ARROW_LEFT', positive: 'ARROW_RIGHT' },
    { axis: 1, negative: 'ARROW_UP', positive: 'ARROW_DOWN' }
];

const AXIS_THRESHOLD = 0.45;
const BUTTON_THRESHOLD = 0.4;

const getGamepads = () => {
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
        return [];
    }
    const pads = navigator.getGamepads();
    if (!pads) {
        return [];
    }
    return Array.from(pads);
};

const hasConnectedGamepads = () => getGamepads().some((pad) => Boolean(pad));

const isButtonPressed = (button) => {
    if (!button) {
        return false;
    }
    if (typeof button === 'number') {
        return button >= BUTTON_THRESHOLD;
    }
    if (typeof button.pressed === 'boolean') {
        return button.pressed;
    }
    if (typeof button.value === 'number') {
        return button.value >= BUTTON_THRESHOLD;
    }
    return false;
};

function dispatchKeyboardEvent(targetWindow, type, actionId) {
    if (!targetWindow) {
        return false;
    }

    const payload = KEYBOARD_ACTIONS[actionId];
    if (!payload) {
        return false;
    }

    try {
        const event = new KeyboardEvent(type, {
            key: payload.key,
            code: payload.code,
            bubbles: true,
            cancelable: true,
            repeat: false
        });
        targetWindow.dispatchEvent(event);
        return true;
    } catch (error) {
        return false;
    }
}

export default function useGamepadKeyboardBridge(getTargetWindow, options = {}) {
    const stateRef = useRef({
        rafId: null,
        activeKeys: new Set()
    });
    const onInput = typeof options.onInput === 'function' ? options.onInput : null;

    useEffect(() => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined' || typeof getTargetWindow !== 'function') {
            return undefined;
        }

        if (typeof navigator.getGamepads !== 'function') {
            return undefined;
        }

        const state = stateRef.current;

        const releaseKey = (actionId) => {
            const targetWindow = getTargetWindow();
            dispatchKeyboardEvent(targetWindow, 'keyup', actionId);
            if (onInput) {
                onInput(actionId, false);
            }
            state.activeKeys.delete(actionId);
        };

        const pressKey = (actionId) => {
            const targetWindow = getTargetWindow();
            const success = dispatchKeyboardEvent(targetWindow, 'keydown', actionId);
            if (success || !state.activeKeys.has(actionId)) {
                state.activeKeys.add(actionId);
            }
            if (onInput) {
                onInput(actionId, true);
            }
        };

        const releaseAllKeys = () => {
            Array.from(state.activeKeys).forEach((actionId) => releaseKey(actionId));
            state.activeKeys.clear();
        };

        const collectDesiredKeys = () => {
            const desiredKeys = new Set();
            const pads = getGamepads();

            pads.forEach((pad) => {
                if (!pad) {
                    return;
                }

                Object.entries(BUTTON_BINDINGS).forEach(([index, actionId]) => {
                    const button = pad.buttons?.[Number(index)];
                    if (isButtonPressed(button)) {
                        desiredKeys.add(actionId);
                    }
                });

                AXIS_BINDINGS.forEach(({ axis, negative, positive }) => {
                    const value = pad.axes?.[axis];
                    if (typeof value !== 'number') {
                        return;
                    }
                    if (value <= -AXIS_THRESHOLD && negative) {
                        desiredKeys.add(negative);
                    } else if (value >= AXIS_THRESHOLD && positive) {
                        desiredKeys.add(positive);
                    }
                });
            });

            return desiredKeys;
        };

        const reconcileKeys = () => {
            const desired = collectDesiredKeys();

            Array.from(state.activeKeys).forEach((actionId) => {
                if (!desired.has(actionId)) {
                    releaseKey(actionId);
                }
            });

            desired.forEach((actionId) => {
                if (!state.activeKeys.has(actionId)) {
                    pressKey(actionId);
                }
            });
        };

        const loop = () => {
            reconcileKeys();
            state.rafId = window.requestAnimationFrame(loop);
        };

        const start = () => {
            if (state.rafId !== null) {
                return;
            }
            state.rafId = window.requestAnimationFrame(loop);
        };

        const stop = () => {
            if (state.rafId !== null) {
                window.cancelAnimationFrame(state.rafId);
                state.rafId = null;
            }
            releaseAllKeys();
        };

        const handleConnect = () => {
            start();
        };

        const handleDisconnect = () => {
            if (!hasConnectedGamepads()) {
                stop();
            }
        };

        const handleBlur = () => {
            releaseAllKeys();
        };

        window.addEventListener('gamepadconnected', handleConnect);
        window.addEventListener('gamepaddisconnected', handleDisconnect);
        window.addEventListener('blur', handleBlur);

        if (hasConnectedGamepads()) {
            start();
        }

        return () => {
            stop();
            window.removeEventListener('gamepadconnected', handleConnect);
            window.removeEventListener('gamepaddisconnected', handleDisconnect);
            window.removeEventListener('blur', handleBlur);
        };
    }, [getTargetWindow, onInput]);
}
