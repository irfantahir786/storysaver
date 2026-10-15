export function getBestProfilePic(versions) {
    if (!Array.isArray(versions) || versions.length === 0) {
        return null;
    }

    let best = null;

    for (const v of versions) {
        if (!v || !v.url) continue;

        if (
            !best ||
            (v.width || 0) > (best.width || 0)
        ) {
            best = v;
        }
    }

    return best ? best.url : null;
}