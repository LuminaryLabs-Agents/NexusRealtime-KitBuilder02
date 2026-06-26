# secure-peer-onnx-kit

Secure ONNX-style inference orchestration over the NexusRealtime peer fabric.

The kit currently implements the orchestration shell and validation/correction layers. Real ONNX Runtime Web sessions can be injected through the runtime adapter interface.

Provides:

- model manifest validation
- startup model-count loading with `exact` and `up-to` modes
- provider fallback order
- job request validation
- claim leases and auto-requeue
- result validation
- health reporting
