const DEFAULT_ACTION_MAP = {
    ARROW_UP: { keyname: 'Up', keyval: 65362, keycode: 111, string: '' },
    ARROW_DOWN: { keyname: 'Down', keyval: 65364, keycode: 116, string: '' },
    ARROW_LEFT: { keyname: 'Left', keyval: 65361, keycode: 113, string: '' },
    ARROW_RIGHT: { keyname: 'Right', keyval: 65363, keycode: 114, string: '' },
    BUTTON_A: { keyname: 'x', keyval: 120, keycode: 53, string: 'x' },
    BUTTON_B: { keyname: 'z', keyval: 122, keycode: 52, string: 'z' },
    BUTTON_X: { keyname: 'a', keyval: 97, keycode: 38, string: 'a' },
    BUTTON_Y: { keyname: 's', keyval: 115, keycode: 39, string: 's' },
    SHOULDER_LEFT: { keyname: 'q', keyval: 113, keycode: 24, string: 'q' },
    SHOULDER_RIGHT: { keyname: 'w', keyval: 119, keycode: 25, string: 'w' },
    START: { keyname: 'Return', keyval: 65293, keycode: 36, string: '\r' },
    SELECT: { keyname: 'Shift_L', keyval: 65505, keycode: 50, string: '' }
};

export function deriveControlUrl(preferredUrl, fallbackStreamUrl) {
    const candidate = preferredUrl || fallbackStreamUrl;
    if (!candidate) {
        return '';
    }
    try {
        const url = new URL(candidate);
        const segments = url.pathname.split('/').filter(Boolean);
        if (!segments.length) {
            url.pathname = '/control';
        } else {
            const lastSegment = segments[segments.length - 1];
            if (lastSegment.includes('.')) {
                segments[segments.length - 1] = 'control';
            } else {
                segments.push('control');
            }
            url.pathname = `/${segments.join('/')}`;
        }
        url.search = '';
        url.hash = '';
        return url.toString();
    } catch (error) {
        console.warn('Unable to derive control URL from', candidate, error);
        return '';
    }
}

export function buildKeyActionPayload(actionId, isPressed, actionMap = DEFAULT_ACTION_MAP) {
    const mapping = actionMap[actionId];
    if (!mapping) {
        return null;
    }
    const {
        keyname,
        keyval = 0,
        string = '',
        keycode = 0,
        group = 0,
        modifiers = []
    } = mapping;

    return {
        command: 'key-action',
        args: [keyname, Boolean(isPressed), modifiers, keyval, string, keycode, group]
    };
}

export async function sendControlCommand(controlUrl, body, meta = null) {
    if (!controlUrl || !body) {
        return;
    }

    const payload = meta ? { ...body, meta } : body;
    try {
        await fetch(controlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn('Failed to reach xpra control endpoint', error);
    }
}

export const XPRA_ACTION_MAP = DEFAULT_ACTION_MAP;
