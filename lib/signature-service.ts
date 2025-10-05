// Minimal stub for SignatureService to satisfy tests; Jest will mock this module
export class SignatureService {
  private static instance: SignatureService;
  static getInstance(): SignatureService {
    if (!this.instance) this.instance = new SignatureService();
    return this.instance;
  }
  async syncSignatures(_opts?: any): Promise<{ synced: number }> {
    return { synced: 0 };
  }
}
