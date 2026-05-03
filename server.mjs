#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// aurekai-mcp — Aurekai MCP server (Phase 2: capability-native)
// Implements MCP stdio + Streamable HTTP transports (spec: modelcontextprotocol.io)
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const VERSION = "0.8.0-alpha.5";

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

// ── Phase 2: Capability-native annotations ────────────────────────────────────

const FAMILY_MAP = {
  akai_api: "runtime",      akai_control: "runtime",  akai_queue: "runtime",
  akai_tier: "runtime",     akai_workflow: "runtime", akai_stitch: "runtime",
  akai_watch: "runtime",    akai_pipeline: "runtime", akai_proxy: "runtime",
  akai_run: "runtime",      akai_runtime: "runtime",
  akai_auth: "commerce",    akai_gate: "commerce",    akai_meter: "commerce",
  akai_ledger: "commerce",  akai_finance: "commerce", akai_pay: "commerce",
  akai_cms: "commerce",     akai_outreach: "commerce",akai_project: "commerce",
  akai_offer: "commerce",   akai_economy: "commerce",
  akai_ingest: "intake",    akai_media_prep: "intake",  akai_transcribe: "intake",
  akai_transcript_clean: "intake", akai_transcript_family: "intake",
  akai_segment: "intake",   akai_paragraph: "intake", akai_frame_extract: "intake",
  akai_video_demux: "intake", akai_scene_detect: "intake", akai_speech_loop: "intake",
  akai_detect_objects: "intake",
  akai_model: "memory",     akai_fpq: "memory",       akai_fpqx: "memory",
  akai_quant: "memory",     akai_sli: "memory",       akai_layer: "memory",
  akai_embed: "memory",     akai_vec: "memory",       akai_sae: "memory",
  akai_kv_cache: "memory",  akai_weaviate_index: "memory",
  akai_canon: "proof",      akai_hash: "proof",       akai_graph: "proof",
  akai_index: "proof",      akai_entity: "proof",     akai_query: "proof",
  akai_proof: "proof",      akai_family: "proof",
  akai_reason: "reason",    akai_physics: "reason",   akai_flow: "reason",
  akai_learn: "reason",     akai_leapfrog: "reason",
  akai_tel: "wire",         akai_wire: "wire",        akai_moq: "wire",
  akai_net: "wire",         akai_recipe: "wire",
  akai_brief: "publish",    akai_narrate: "publish",  akai_render: "publish",
  akai_pack: "publish",     akai_emit: "publish",     akai_distribute: "publish",
  akai_clips: "publish",    akai_repurpose: "publish",akai_surface: "publish",
  akai_capability: "substrate", akai_space: "substrate", akai_time: "substrate",
  akai_compress: "substrate",   akai_violence: "substrate",
  akai_gen: "substrate",    akai_tag: "substrate",    akai_sync: "substrate",
  akai_swarm: "substrate",  akai_discip: "substrate", akai_fragment: "substrate",
  akai_flash_qla: "substrate",  akai_mfa_dict: "substrate",
  akai_cli: "substrate",    akai_orchestrate: "substrate", akai_tone: "substrate",
};

const PROOF_EMITTING = new Set([
  "akai_proof", "akai_canon", "akai_hash", "akai_graph", "akai_index",
  "akai_pipeline", "akai_workflow",
]);

const READONLY_TOOLS = new Set([
  "akai_capability", "akai_runtime", "akai_api", "akai_query", "akai_layer",
  "akai_model", "akai_queue", "akai_watch", "akai_index", "akai_graph",
  "akai_ledger", "akai_meter", "akai_vec", "akai_embed", "akai_sae",
  "akai_entity", "akai_transcript_family",
]);

const IDEMPOTENT_TOOLS = new Set([
  "akai_hash", "akai_embed", "akai_vec", "akai_query", "akai_entity",
  "akai_compress", "akai_quant", "akai_fpq", "akai_fpqx",
  "akai_transcribe", "akai_transcript_clean",
]);

// Inject MCP tool annotations and family prefix into every tool definition
for (const tool of TOOL_DEFS) {
  const family = FAMILY_MAP[tool.name] || "substrate";
  tool.annotations = {
    readOnlyHint:    READONLY_TOOLS.has(tool.name),
    destructiveHint: tool.name === "akai_violence" || tool.name === "akai_pipeline",
    idempotentHint:  IDEMPOTENT_TOOLS.has(tool.name) || READONLY_TOOLS.has(tool.name),
    openWorldHint:   false,
  };
  if (!tool.description.startsWith(`[${family}]`)) {
    tool.description = `[${family}] ${tool.description}`;
  }
}

// ── MCP Resources ─────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    uri: "aurekai://runtime/capabilities",
    name: "Capability Registry",
    description: "All 9 Akai capability families, 111 commands, packs A–I, and experimental tracks.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://queue/stats",
    name: "Queue Stats",
    description: "Live job queue depth, throughput, and error rates for all Akai operators.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://ledger/portfolio",
    name: "Commerce Ledger Portfolio",
    description: "Aggregate billing, usage metering, and invoice records.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://models",
    name: "Model Registry",
    description: "All registered model entries: id, path, quantization, family compatibility.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://model-memory",
    name: "Model Memory",
    description: "FPQ compressed model memory state: lattice alignment, KV cache ancestry.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://features/{artifact}",
    name: "Feature Report",
    description: "Feature-level activation report for a given artifact id. Replace {artifact} with artifact id.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://proof/{id}",
    name: "Proof Bundle",
    description: "Canonical proof bundle (.akproof) for a given artifact or run id. Replace {id} with proof id.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://graph/{node}/lineage",
    name: "Lineage Graph",
    description: "Merkle-rooted lineage graph for a workflow node. Replace {node} with node id.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://space/{name}",
    name: "Space",
    description: "Named project space with manifest, jobs, and artifacts. Replace {name} with space name.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://wire/{capture_id}",
    name: "Wire Capture",
    description: "Captured wire session: PCAP summary, SIP events, call graph. Replace {capture_id} with session id.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://project/{id}",
    name: "Project",
    description: "Full project record: client, deliverables, timeline, invoice refs. Replace {id} with project id.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://invoice/{id}",
    name: "Invoice",
    description: "Commerce invoice document with line items and payment status. Replace {id} with invoice id.",
    mimeType: "application/json",
  },
  {
    uri: "aurekai://cms/{entry_id}",
    name: "CMS Entry",
    description: "Published CMS content entry with format, metadata, and proof ref. Replace {entry_id} with entry id.",
    mimeType: "application/json",
  },
];

// ── MCP Prompts ───────────────────────────────────────────────────────────────

const PROMPTS = [
  {
    name: "turn-this-call-into-a-deliverable",
    description: "Given a raw call recording or audio file, transcribe, clean, brief, and produce a client deliverable.",
    arguments: [
      { name: "audio_path",   description: "Path or URI to audio/call recording", required: true },
      { name: "client_name",  description: "Client name for the deliverable header", required: false },
    ],
  },
  {
    name: "inspect-this-artifact-lineage",
    description: "Resolve the full Merkle lineage and proof chain for a given artifact id.",
    arguments: [
      { name: "artifact_id", description: "Artifact id or proof bundle id to inspect", required: true },
    ],
  },
  {
    name: "build-a-model-memory-pack",
    description: "Compress and pack model weights via FPQ, run roundtrip, and export a memory pack.",
    arguments: [
      { name: "model_path",  description: "Local path to model weights", required: true },
      { name: "target_bits", description: "Target quantization bits (default: 4)", required: false },
    ],
  },
  {
    name: "compare-these-reasoning-branches",
    description: "Run two reasoning branches and produce a diff report with recommendation.",
    arguments: [
      { name: "branch_a", description: "First reasoning context or task description",  required: true },
      { name: "branch_b", description: "Second reasoning context or task description", required: true },
    ],
  },
  {
    name: "generate-client-invoice-from-usage",
    description: "Pull metering records, apply margin rules, and generate a commerce invoice.",
    arguments: [
      { name: "client_id", description: "Client identifier",                       required: true },
      { name: "period",    description: "Billing period (e.g. 2025-05)",           required: false },
    ],
  },
  {
    name: "produce-wire-device-report",
    description: "Ingest a PCAP or wire capture and produce a device event and SIP report.",
    arguments: [
      { name: "capture_path", description: "Path to PCAP or wire capture file", required: true },
    ],
  },
  {
    name: "run-a-release-gate",
    description: "Run all release gate checks: proof validation, manifest verify, SLI auto-run.",
    arguments: [
      { name: "release_tag", description: "Git tag or release version to gate", required: true },
    ],
  },
  {
    name: "make-a-client-brief-from-this-audio",
    description: "Transcribe audio, extract key points, and generate a structured client brief.",
    arguments: [
      { name: "audio_path", description: "Path or URI to audio recording",                             required: true },
      { name: "format",     description: "Output format: markdown, pdf, docx (default: markdown)",    required: false },
    ],
  },
];

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
      capabilities: {
        tools:     {},
        resources: { subscribe: true, listChanged: true },
        prompts:   { listChanged: false },
        logging:   {},
      },
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
    const isError = !!(result.error || result.exit_code !== 0);
    const text = result.error
      ? `Error: ${result.error}`
      : `exit: ${result.exit_code}\n${result.stdout}${result.stderr ? "\nstderr: " + result.stderr : ""}`;

    const runId = randomUUID();
    const family = FAMILY_MAP[name] || "substrate";
    const proofEmitting = PROOF_EMITTING.has(name);

    const response = {
      content: [{ type: "text", text }],
      isError,
      _meta: {
        run_id:        runId,
        family,
        operator:      akaiCmd,
        proof_emitting: proofEmitting,
        ...(proofEmitting && !isError ? {
          artifact_uri: `aurekai://proof/${runId}`,
          lineage_uri:  `aurekai://graph/${runId}/lineage`,
        } : {}),
      },
    };

    // Embed artifact resource reference when a proof-emitting tool succeeds
    if (proofEmitting && !isError) {
      response.content.push({
        type: "resource",
        resource: {
          uri:      `aurekai://proof/${runId}`,
          mimeType: "application/json",
          text: JSON.stringify({ proof_id: runId, operator: akaiCmd, family, status: "pending" }),
        },
      });
    }

    return ok(id, response);
  }

  if (method === "resources/list") {
    const cursor = params?.cursor ? parseInt(params.cursor, 10) : 0;
    const pageSize = 10;
    const page = RESOURCES.slice(cursor, cursor + pageSize);
    const nextCursor = cursor + pageSize < RESOURCES.length
      ? String(cursor + pageSize)
      : undefined;
    const result = { resources: page };
    if (nextCursor) result.nextCursor = nextCursor;
    return ok(id, result);
  }

  if (method === "resources/read") {
    const { uri } = params || {};
    if (!uri) return err(id, -32602, "Missing uri param");

    // Static resources
    const staticResource = RESOURCES.find(r => r.uri === uri);

    // Runtime read: for template URIs return stub JSON
    let contents;
    if (uri === "aurekai://runtime/capabilities") {
      const akai = findAkai();
      let capText;
      if (akai) {
        const r = spawnSync(akai, ["runtime", "capabilities", "--json"], { encoding: "utf-8", timeout: 5000 });
        capText = r.stdout || JSON.stringify({ error: "no output", stderr: r.stderr });
      } else {
        capText = JSON.stringify({ error: "akai not found on PATH", families: 9, commands: 111, version: VERSION });
      }
      contents = [{ uri, mimeType: "application/json", text: capText }];
    } else if (uri === "aurekai://queue/stats") {
      const akai = findAkai();
      let statsText;
      if (akai) {
        const r = spawnSync(akai, ["queue", "stats", "--json"], { encoding: "utf-8", timeout: 5000 });
        statsText = r.stdout || JSON.stringify({ error: "no output" });
      } else {
        statsText = JSON.stringify({ error: "akai not found on PATH" });
      }
      contents = [{ uri, mimeType: "application/json", text: statsText }];
    } else if (uri === "aurekai://models") {
      const akai = findAkai();
      let modelsText;
      if (akai) {
        const r = spawnSync(akai, ["model", "list", "--json"], { encoding: "utf-8", timeout: 5000 });
        modelsText = r.stdout || JSON.stringify({ error: "no output" });
      } else {
        modelsText = JSON.stringify({ error: "akai not found on PATH" });
      }
      contents = [{ uri, mimeType: "application/json", text: modelsText }];
    } else if (staticResource) {
      // Template or live resources: return a stub with instructions
      contents = [{
        uri,
        mimeType: staticResource.mimeType,
        text: JSON.stringify({
          _stub: true,
          description: staticResource.description,
          hint: "Invoke the corresponding akai operator with the relevant id/name to get live data.",
        }),
      }];
    } else {
      return err(id, -32602, `Unknown resource URI: ${uri}`);
    }

    return ok(id, { contents });
  }

  if (method === "resources/subscribe") {
    // Acknowledge subscription — live push not yet implemented
    return ok(id, {});
  }

  if (method === "resources/unsubscribe") {
    return ok(id, {});
  }

  if (method === "prompts/list") {
    return ok(id, { prompts: PROMPTS });
  }

  if (method === "prompts/get") {
    const { name, arguments: args = {} } = params || {};
    const prompt = PROMPTS.find(p => p.name === name);
    if (!prompt) return err(id, -32602, `Unknown prompt: ${name}`);

    // Build messages array from prompt arguments
    const parts = [];
    for (const arg of (prompt.arguments || [])) {
      const val = args[arg.name];
      if (val) parts.push(`${arg.name}: ${val}`);
    }
    const userText = parts.length
      ? `[${name}]\n${parts.join("\n")}`
      : `[${name}]\n${prompt.description}`;

    return ok(id, {
      description: prompt.description,
      messages: [
        { role: "user", content: { type: "text", text: userText } },
      ],
    });
  }

  if (method === "logging/setLevel") {
    // Accept level changes — logging to stderr
    return ok(id, {});
  }

  if (method === "ping") return ok(id, {});

  return err(id, -32601, `Method not found: ${method}`);
}

// ── Streamable HTTP transport ─────────────────────────────────────────────────
// Enabled when AKAI_MCP_HTTP_PORT is set (e.g. AKAI_MCP_HTTP_PORT=3100)
const HTTP_PORT = process.env.AKAI_MCP_HTTP_PORT ? parseInt(process.env.AKAI_MCP_HTTP_PORT, 10) : null;

if (HTTP_PORT) {
  const httpServer = createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/mcp") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found — POST to /mcp" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      let parsed;
      try { parsed = JSON.parse(body); } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }));
        return;
      }
      const requests = Array.isArray(parsed) ? parsed : [parsed];
      const responses = requests
        .map(r => handle(r))
        .filter(Boolean);
      const out = responses.length === 1 ? responses[0] : JSON.stringify(responses.map(r => JSON.parse(r)));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(out);
    });
  });
  httpServer.listen(HTTP_PORT, "127.0.0.1", () => {
    process.stderr.write(`aurekai-mcp HTTP transport listening on http://127.0.0.1:${HTTP_PORT}/mcp\n`);
  });
}

// ── stdio transport ───────────────────────────────────────────────────────────
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
