import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mocks for express and its helpers before importing the app module.
const mockUse = vi.fn();
const mockApp = { use: mockUse } as unknown as any;

const mockJson = vi.fn(() => "jsonMiddleware");
const mockExpressDefault = vi.fn(() => mockApp);
// attach json to the default export (express.json())
(mockExpressDefault as any).json = mockJson;

const mockRouterInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
};
const mockRouter = vi.fn(() => mockRouterInstance);

vi.mock("express", () => ({
    default: mockExpressDefault,
    Router: mockRouter,
}));

const mockCors = vi.fn(() => "corsMiddleware");
vi.mock("cors", () => ({ default: mockCors }));

describe("app", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Ensure modules are reloaded so mocks are applied fresh for each test
        vi.resetModules();
    });

    it("should configure cors, json middleware and mount /api/tasks route", async () => {
        // Import the app after setting up mocks so the module executes with them.
        const { default: app } = await import("../../app.js");

        // The app exported should be the object returned by our mocked express()
        expect(app).toBe(mockApp);

        // express() should have been called once to create the app
        expect(mockExpressDefault).toHaveBeenCalledTimes(1);

        // express.json() and cors() should have been called to obtain middlewares
        expect(mockJson).toHaveBeenCalledTimes(1);
        expect(mockCors).toHaveBeenCalledTimes(1);

        // app.use should have been called three times: cors, json, and the tasks route
        expect(mockUse).toHaveBeenCalledTimes(3);

        // Verify the exact calls/order
        expect(mockUse.mock.calls[0][0]).toBe("corsMiddleware");
        expect(mockUse.mock.calls[1][0]).toBe("jsonMiddleware");

        // The third call should mount the tasks route under /api/tasks
        expect(mockUse.mock.calls[2][0]).toBe("/api/tasks");
        // and the mounted handler should be defined (router instance)
        expect(mockUse.mock.calls[2][1]).toBeDefined();
    });
});
