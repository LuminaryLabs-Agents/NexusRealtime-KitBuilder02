export class FakeOnnxRuntime {
  constructor({ supportedProviders = ['wasm'], failModels = new Set() } = {}) {
    this.supportedProviders = supportedProviders;
    this.failModels = failModels;
  }

  async createSession(manifest, { provider }) {
    if (this.failModels.has(manifest.modelId)) throw new Error('simulated_model_load_failure');
    return {
      provider,
      manifest,
      async run(input) {
        return { modelId: manifest.modelId, provider, input, output: input };
      },
      async runTestVector() {
        return { ok: true };
      }
    };
  }
}
