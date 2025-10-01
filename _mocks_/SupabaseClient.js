// __mocks__/SupabaseClient.js
module.exports = {
    auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
        select: jest.fn(),
        insert: jest.fn(),
        delete: jest.fn(),
        eq: jest.fn(),
    })),
};
