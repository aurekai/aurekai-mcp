#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// aurekai-mcp — Aurekai MCP server exposing 89 native runtime operators
// Implements MCP stdio JSON-RPC transport (spec: modelcontextprotocol.io)
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

const VERSION = "0.8.0-alpha.3";

const TOOL_DEFS = [
  {
    "name": "akai_api",
    "description": "AkaiAPI v2 \u2014 Async HTTP gateway for the Akai binary family. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_auth",
    "description": "AkaiAuth \u2014 user management and session tokens. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_brief",
    "description": "preserve document order */. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_cli",
    "description": "akai \u2014 unified CLI dispatcher. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_cms",
    "description": "AkaiCMS \u2014 stripped binary CMS. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_canon",
    "description": "AkaiCanon \u2014 structure-aware canonicalization via Tree-sitter. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_capability",
    "description": "akai-capability - capability discovery and matching layer. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_clips",
    "description": "AkaiClips \u2014 Clip Discovery Engine. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_compete",
    "description": "akai-compete \u2014 stage/model A/B competition engine. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_compress",
    "description": "AkaiCompress \u2014 family-aware compression engine. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_control",
    "description": "akai-control \u2014 control plane for Akai inference pipelines. (category: misc)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_detect_objects",
    "description": "AkaiDetectObjects \u2014 Object detection operator for V1/I1 pipelines. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_discip",
    "description": "AkaiDiscipl operator. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_distribute",
    "description": "AkaiDistribute operator. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_economy",
    "description": "akai-economy \u2014 cost-aware routing and budget enforcement. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_embed",
    "description": "AkaiEmbed \u2014 text embeddings via ONNX Runtime C API. Produces: .bfvec. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_emit",
    "description": "AkaiEmit \u2014 multi-format output engine. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_entity",
    "description": "akai-entity \u2014 universal identity resolution layer. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_fpq",
    "description": "main.c \u2014 akai-fpq CLI. Produces: .bfq. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_fpqx",
    "description": "akai-fpqx \u2014 Cross-family FPQ alignment. Accepts: .bfq. Produces: .bfqx. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_family",
    "description": "akai-family - conceptual family browser for Akai. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_finance",
    "description": "AkaiFinance \u2014 service arbitrage, labor pipeline, and bundle pricing engine. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_flash_qla",
    "description": "akai-flashqla \u2014 AkaiGDN Chunked Prefill (native C kernel). (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_flow",
    "description": "akai-flow \u2014 coroutine-native pipeline programming. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_fragment",
    "description": "AkaiFragment \u2014 Fragment system CLI. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_frame_extract",
    "description": "akai-frame-extract. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_gate",
    "description": "AkaiGate \u2014 license enforcement + access control. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_gen",
    "description": "akai-gen \u2014 natural language \u2192 recipe YAML generator. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_graph",
    "description": "AkaiGraph \u2014 Merkle-DAG artifact graph engine. Produces: .bfgraph. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_hash",
    "description": "AkaiHash \u2014 content-addressing + Merkle DAG hashing engine. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_index",
    "description": "AkaiIndex \u2014 artifact family indexer and search engine. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_ingest",
    "description": "AkaiIngest \u2014 universal intake binary. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_kv_cache",
    "description": "akai-kvcache \u2014 v8 RLF KV cache compression. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_layer",
    "description": "akai-layer \u2014 Layer-aware ONNX model inspection and extraction (C port). (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_leapfrog",
    "description": "akai-leapfrog \u2014 Hamiltonian conservation and reversibility test. Accepts: .bfq, .bfvec. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_learn",
    "description": "akai-learn \u2014 artifact-level feedback and threshold tuning. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_ledger",
    "description": "AkaiLedger \u2014 value accounting engine. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_mfa_dict",
    "description": "AkaiMFADict operator. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_media_prep",
    "description": "AkaiMediaPrep operator. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_meter",
    "description": "AkaiMeter \u2014 usage metering + billing events. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_moq",
    "description": "akai-moq \u2014 Media over QUIC style relay for Akai. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_model",
    "description": "AkaiModel \u2014 model dependency manager for akai pipelines. Produces: .bfmodel. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_narrate",
    "description": "AkaiNarrate v3 \u2014 Verified Tone-Aware Text-to-Speech Synthesis. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_net",
    "description": "akai-net \u2014 Akai Netlist Runtime. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_offer",
    "description": "Also try to read proof-summary.json from. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_orchestrate",
    "description": "AkaiOrchestrate operator. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_outreach",
    "description": "AkaiOutreach \u2014 quiet distribution engine. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_pack",
    "description": "AkaiPack operator. Produces: .bf, .bfa. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_paragraph",
    "description": "AkaiParagraph operator. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_pay",
    "description": "AkaiPay \u2014 payment & invoice management. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_physics",
    "description": "akai-physics \u2014 Hamiltonian Version Control Protocol (HVCP) CLI. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_pipeline",
    "description": "AkaiPipeline \u2014 unified single-process pipeline. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_project",
    "description": "AkaiProject operator. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_proof",
    "description": "AkaiProof operator. Accepts: .bf. Produces: .bfproof. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_proxy",
    "description": "AkaiProxy \u2014 OpenAI-compatible API shim for Akai binaries. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_quant",
    "description": "akai-quant \u2014 FPQ v8 Recursive Lattice-Flow weight quantization. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_query",
    "description": "AkaiQuery \u2014 local analytics engine over artifacts via DuckDB. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_queue",
    "description": "AkaiQueue v2 \u2014 SQLite-backed job queue with built-in worker daemon. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_reason",
    "description": "akai-reason \u2014 Reason-state operator over the HVCP stack. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_recipe",
    "description": "AkaiRecipe \u2014 Recipe Registry Management. Produces: .bfrecipe. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_render",
    "description": "AkaiRender operator. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_repurpose",
    "description": "AkaiRepurpose \u2014 Transform brief artifacts into social media formats. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_run",
    "description": "AkaiRun \u2014 Recipe Executor. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_runtime",
    "description": "Try top-level sibling path: ../SiblingDir/binary */. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_sae",
    "description": "akai-sae \u2014 SAE feature dictionary runtime. Produces: .bfsae. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_sli",
    "description": "akai-sli \u2014 Structured Layer Inference. Accepts: .bfqx, .bfsae. (category: inference)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_scene_detect",
    "description": "akai-scene-detect. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_segment",
    "description": "AkaiSegment \u2014 Idea Boundary Detection + Segment Graph. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_space",
    "description": "akai-space \u2014 shared memory substrate. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_speech_loop",
    "description": "AkaiSpeechLoop \u2014 Whisper \u2192 Transform \u2192 Piper speech transformation. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_stitch",
    "description": "AkaiStitch \u2014 DAG materializer. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_surface",
    "description": "AkaiSurface operator. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_swarm",
    "description": "AkaiSwarm \u2014 P2P artifact distribution via BitTorrent v2 protocol. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_sync",
    "description": "AkaiSync operator. (category: artifacts)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_tag",
    "description": "AkaiTag \u2014 instant intent/topic tagging via fastText (pure C). Produces: .bftag. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_tel",
    "description": "AkaiTel \u2014 FreeSWITCH Event Socket telephony adapter. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_tier",
    "description": "akai-tier \u2014 latency tier management and SLA enforcement. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_time",
    "description": "akai-time \u2014 temporal pipeline manager. (category: data)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_tone",
    "description": "AkaiTone \u2014 speech tone/emotion/rhythm extraction via OpenSMILE. Produces: .bftone. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_transcribe",
    "description": "================================================================. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_transcript_clean",
    "description": "AkaiTranscriptClean operator. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_transcript_family",
    "description": "AkaiTranscriptFamily operator. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_vec",
    "description": "AkaiVec \u2014 local vector search via sqlite-vec. Accepts: .bf. Produces: .bfvec. (category: knowledge)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_video_demux",
    "description": "akai-video-demux. (category: media)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_violence",
    "description": "akai-violence \u2014 real coupling test harness. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_watch",
    "description": "AkaiWatch operator. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_weaviate_index",
    "description": "AkaiWeaviateIndex operator. (category: specialized)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_wire",
    "description": "AkaiWire operator. (category: platform)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  },
  {
    "name": "akai_workflow",
    "description": "akai-workflow - workflow profile browser. (category: pipeline)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "args": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "CLI arguments to pass to the operator"
        },
        "stdin": {
          "type": "string",
          "description": "Optional stdin data"
        }
      },
      "required": []
    }
  }
];

const AKAI_CMD_MAP = {
  "akai_api": "api",
  "akai_auth": "auth",
  "akai_brief": "brief",
  "akai_cli": "cli",
  "akai_cms": "cms",
  "akai_canon": "canon",
  "akai_capability": "capability",
  "akai_clips": "clips",
  "akai_compete": "compete",
  "akai_compress": "compress",
  "akai_control": "control",
  "akai_detect_objects": "detect-objects",
  "akai_discip": "discip",
  "akai_distribute": "distribute",
  "akai_economy": "economy",
  "akai_embed": "embed",
  "akai_emit": "emit",
  "akai_entity": "entity",
  "akai_fpq": "fpq",
  "akai_fpqx": "fpqx",
  "akai_family": "family",
  "akai_finance": "finance",
  "akai_flash_qla": "flash-qla",
  "akai_flow": "flow",
  "akai_fragment": "fragment",
  "akai_frame_extract": "frame-extract",
  "akai_gate": "gate",
  "akai_gen": "gen",
  "akai_graph": "graph",
  "akai_hash": "hash",
  "akai_index": "index",
  "akai_ingest": "ingest",
  "akai_kv_cache": "kv-cache",
  "akai_layer": "layer",
  "akai_leapfrog": "leapfrog",
  "akai_learn": "learn",
  "akai_ledger": "ledger",
  "akai_mfa_dict": "mfa-dict",
  "akai_media_prep": "media-prep",
  "akai_meter": "meter",
  "akai_moq": "moq",
  "akai_model": "model",
  "akai_narrate": "narrate",
  "akai_net": "net",
  "akai_offer": "offer",
  "akai_orchestrate": "orchestrate",
  "akai_outreach": "outreach",
  "akai_pack": "pack",
  "akai_paragraph": "paragraph",
  "akai_pay": "pay",
  "akai_physics": "physics",
  "akai_pipeline": "pipeline",
  "akai_project": "project",
  "akai_proof": "proof",
  "akai_proxy": "proxy",
  "akai_quant": "quant",
  "akai_query": "query",
  "akai_queue": "queue",
  "akai_reason": "reason",
  "akai_recipe": "recipe",
  "akai_render": "render",
  "akai_repurpose": "repurpose",
  "akai_run": "run",
  "akai_runtime": "runtime",
  "akai_sae": "sae",
  "akai_sli": "sli",
  "akai_scene_detect": "scene-detect",
  "akai_segment": "segment",
  "akai_space": "space",
  "akai_speech_loop": "speech-loop",
  "akai_stitch": "stitch",
  "akai_surface": "surface",
  "akai_swarm": "swarm",
  "akai_sync": "sync",
  "akai_tag": "tag",
  "akai_tel": "tel",
  "akai_tier": "tier",
  "akai_time": "time",
  "akai_tone": "tone",
  "akai_transcribe": "transcribe",
  "akai_transcript_clean": "transcript-clean",
  "akai_transcript_family": "transcript-family",
  "akai_vec": "vec",
  "akai_video_demux": "video-demux",
  "akai_violence": "violence",
  "akai_watch": "watch",
  "akai_weaviate_index": "weaviate-index",
  "akai_wire": "wire",
  "akai_workflow": "workflow"
};

function findAkai() {
  const candidates = [
    process.env.AKAI_BIN,
    "akai",
    "./bin/akai",
  ].filter(Boolean);
  for (const c of candidates) {
    const r = spawnSync("which", [c], { encoding: "utf-8" });
    if (r.status === 0) return c;
  }
  return null;
}

function runOperator(akaiCmd, args, stdin) {
  const akai = findAkai();
  if (!akai) {
    return { error: "akai not found on PATH — install aurekai/native-runtime and rebuild operators" };
  }
  const result = spawnSync(akai, [akaiCmd, ...args], {
    input: stdin || undefined,
    encoding: "utf-8",
    timeout: 30000,
    maxBuffer: 4 * 1024 * 1024,
  });
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    exit_code: result.status ?? -1,
  };
}

// JSON-RPC helpers
function ok(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}
function err(id, code, message) {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

// Handle MCP requests
function handle(req) {
  const { id, method, params } = req;

  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "aurekai-mcp", version: VERSION },
    });
  }

  if (method === "initialized") return null;

  if (method === "tools/list") {
    return ok(id, { tools: TOOL_DEFS });
  }

  if (method === "tools/call") {
    const { name, arguments: args = {} } = params;
    const akaiCmd = AKAI_CMD_MAP[name];
    if (!akaiCmd) {
      return err(id, -32601, `Unknown tool: ${name}`);
    }
    const result = runOperator(akaiCmd, args.args || [], args.stdin || "");
    const text = result.error
      ? `Error: ${result.error}`
      : `exit: ${result.exit_code}\n${result.stdout}${result.stderr ? "\nstderr: " + result.stderr : ""}`;
    return ok(id, {
      content: [{ type: "text", text }],
      isError: !!(result.error || result.exit_code !== 0),
    });
  }

  if (method === "ping") return ok(id, {});

  return err(id, -32601, `Method not found: ${method}`);
}

// stdio transport
const rl = createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let req;
  try { req = JSON.parse(trimmed); } catch { return; }
  const response = handle(req);
  if (response !== null) process.stdout.write(response + "\n");
});
rl.on("close", () => process.exit(0));
