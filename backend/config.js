module.exports = {
    port: process.env.PORT || 3002,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fridgi',
    JWT_SECRET: process.env.JWT_SECRET || 'c4a1225086f864ofn3i9f2237ec7a189c001f5de506ed171ac9c88f3kc7021ea20a79b1317bUhXahSHmnZ5b5atmNS8J+JMug4ypjV/BUGSM17bUhXVw@4RexKBSpXHSvszeaHfKtH4HqYHvsqr5/JSJ29Tz1ORexKBSpXHSvszeaHfKtH4HqY',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'c4a1225086f864ofn3i9f2237ec7a189c001f5de506ed171ac9c88f3kc7021ea20a79b1317bUhXahSHmnZ5b5atmNS8J+JMug4ypjV/BUGSM17bUhXVw@4RexKBSpXHSvszeaHfKtH4HqYHvsqr5/JSJ29Tz1ORexKBSpXHSvszeaHfKtH4HqY',
};