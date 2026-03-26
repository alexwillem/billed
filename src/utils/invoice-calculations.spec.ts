import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";
import { setTotalAmount } from "./invoice-calculations.js";
import { projectContractManager } from "./project-contract-manager.js";

describe("setTotalAmount", () => {
  const mockGet = vi.fn();
  let mockProjectContract: any;

  beforeEach(() => {
    mockProjectContract = structuredClone(mockContractInstance);

    vi.mocked(projectContractManager).get = mockGet;
    mockGet.mockReturnValue(mockProjectContract);

    setTotalAmount();
  });

  it("should set amount", () => {
    expect(setTotalAmount().itemsAmount).toBe(1000);
    expect(setTotalAmount().vatAmount).toBe(100);
    expect(setTotalAmount().billedAmount).toBe(1100);
  });

  it("should convert string to number", () => {
    mockProjectContract.projectDetails.workItems[1].rate = "50";

    setTotalAmount();

    expect(setTotalAmount().itemsAmount).toBe(1000);
  });
});
