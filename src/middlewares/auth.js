import passport from 'passport';

export const requireAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ status: 'error', message: info?.message || 'No autorizado. Token inválido o no enviado.' });
        req.user = user;
        next();
    })(req, res, next);
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ status: 'error', message: 'No autorizado' });
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: rol insuficiente' });
        }
        next();
    };
};

export const authorizeCartOwner = () => {
    return (req, res, next) => {
        const userCartId = req.user?.cart;
        const paramCid = req.params.cid;

        if (!userCartId) {
            return res.status(403).json({ status: 'error', message: 'Usuario no tiene carrito asignado' });
        }

        if (String(userCartId) !== String(paramCid)) {
            return res.status(403).json({ status: 'error', message: 'Prohibido: solo el dueño del carrito' });
        }

        next();
    };
};
