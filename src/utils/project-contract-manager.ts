import fs from "fs";
import { PATHS } from "../config/paths.config.js";
import { INITIAL_PROFILE } from "../config/profiles.config.js";
import {
  ProfileKey,
  Profiles,
  ProjectContract,
} from "../types/profile-types.js";

export class ProjectContractManager {
  private contractPath = PATHS.PROJECT_CONTRACT;
  #contract = INITIAL_PROFILE;

  constructor() {
    this.ensureConfigDirExists();
  }

  private ensureConfigDirExists(): void {
    if (!fs.existsSync(PATHS.CONTRACTS_DIR)) {
      fs.mkdirSync(PATHS.CONTRACTS_DIR, { recursive: true });
    }
  }

  public async load(): Promise<ProjectContract> {
    try {
      const data = fs.readFileSync(this.contractPath, "utf-8");

      this.#contract = JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.#contract = INITIAL_PROFILE as ProjectContract;
    }
    return this.#contract;
  }

  public save(): void {
    fs.writeFileSync(
      this.contractPath,
      JSON.stringify(this.#contract, null, 2),
    );
  }

  public get(): ProjectContract {
    return { ...this.#contract };
  }

  public update<Key extends ProfileKey>(
    profile: Key,
    updates: Partial<Profiles[Key]>,
  ): void {
    const currentProfile = this.#contract[profile] || {};
    const mergedProfile = { ...currentProfile, ...updates };

    this.#contract = {
      ...this.#contract,
      [profile]: mergedProfile,
    };
  }

  public replace<Key extends ProfileKey>(
    profile: Key,
    replacement: Profiles[Key],
  ): void {
    this.#contract = {
      ...this.#contract,
      [profile]: replacement,
    };
  }

  public async hasContract(): Promise<boolean> {
    try {
      fs.accessSync(PATHS.PROJECT_CONTRACT);
      return Object.keys(this.#contract).length > 0;
    } catch {
      return false;
    }
  }

  public initializeDirectories(): void {
    const dirsToCreate = [
      PATHS.DATA_DIR,
      PATHS.CONTRACTS_DIR,
      PATHS.OUTPUT_DIR,
    ];

    for (const dir of dirsToCreate) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.ensureContractFile();
  }

  private ensureContractFile(): void {
    try {
      const content = fs.readFileSync(PATHS.PROJECT_CONTRACT, "utf-8");

      if (!content) {
        fs.writeFileSync(PATHS.PROJECT_CONTRACT, "{}");
      }
    } catch (err: any) {
      if (err.code === "ENOENT") {
        fs.writeFileSync(PATHS.PROJECT_CONTRACT, "{}");
      } else {
        throw err;
      }
    }
  }
}

export const projectContractManager = new ProjectContractManager();
