import { isOwner } from "../../src/middlewares/ownerMiddleware.js";
import { CustomError } from "../../src/utils/errorUtils/customError.js";

describe("isOwner middleware", () => {
    const mockModel = {
        findById: jest.fn(),
    };

    const ownerId = "user123";
    const resourceId = "res123";

    const createReq = (id = resourceId, user = { _id: ownerId }) => ({
        params: { id },
        user,
    });

    test("should call next if user is owner", async () => {
        mockModel.findById.mockResolvedValue({ _ownerId: ownerId });

        const req = createReq();
        const next = jest.fn();

        await isOwner(mockModel)(req, {}, next);

        expect(mockModel.findById).toHaveBeenCalledWith(resourceId);
        expect(next).toHaveBeenCalledWith(); // no error
    });

    test("should throw 404 if resource not found", async () => {
        mockModel.findById.mockResolvedValue(null);

        const req = createReq();
        const next = jest.fn();

        await isOwner(mockModel)(req, {}, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].statusCode).toBe(404);
    });

    test("should throw 403 if user is not owner", async () => {
        mockModel.findById.mockResolvedValue({ _ownerId: "someoneElse" });

        const req = createReq();
        const next = jest.fn();

        await isOwner(mockModel)(req, {}, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
});
