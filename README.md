<p align="center">
  <img src="https://raw.githubusercontent.com/aurekai/aurekai/main/assets/aurekai-logo.svg" alt="Aurekai" width="520" />
</p>

# `@aurekai/mcp` — Aurekai MCP Server

**`0.8.0-alpha.5`** · capability-native · zero dependencies · stdio + Streamable HTTP

Exposes all 9 Aurekai capability families (111 commands) as MCP tools with full protocol-level features:
tool annotations, resource pagination, named prompts, `_meta` proof propagation, and embedded resource outputs.

## Install

```bash
npm install -g @aurekai/mcp
```

## Usage

### stdio (default — for Claude Desktop, Cursor, etc.)

```jsonc
// claude_desktop_config.json
{
  "mcpServers": {
    "aurekai": {
      "command": "aurekai-mcp"
    }
  }
}
```

### Streamable HTTP (optional)

```bash
AKAI_MCP_HTTP_PORT=3100 aurekai-mcp
# POST JSON-RPC to http://127.0.0.1:3100/mcp
```

## Protocol Surface

| Feature | Status |
|---|---|
| `tools/list` — 89 operators across 9 capability families | ✅ |
| Tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) | ✅ |
| `resources/list` — 13 `aurekai://` resource URIs | ✅ |
| `resources/read` — live reads for runtime/capabilities, queue/stats, models | ✅ |
| Resource pagination (`nextCursor`) | ✅ |
| Resource subscriptions (acknowledge) | ✅ |
| `prompts/list` + `prompts/get` — 8 named capability prompts | ✅ |
| `_meta` proof propagation on tool call results | ✅ |
| Embedded resource outputs for proof-emitting tools | ✅ |
| `logging` server capability | ✅ |
| Streamable HTTP transport (`AKAI_MCP_HTTP_PORT`) | ✅ |

## Capability Families

| Family | Operators | Examples |
|---|---|---|
| `runtime` | 11 | `akai_api`, `akai_queue`, `akai_workflow` |
| `commerce` | 11 | `akai_gate`, `akai_pay`, `akai_ledger` |
| `intake` | 12 | `akai_transcribe`, `akai_ingest`, `akai_segment` |
| `memory` | 11 | `akai_fpq`, `akai_fpqx`, `akai_embed`, `akai_vec` |
| `proof` | 8 | `akai_proof`, `akai_canon`, `akai_graph`, `akai_hash` |
| `reason` | 5 | `akai_reason`, `akai_physics`, `akai_flow`, `akai_learn` |
| `wire` | 5 | `akai_tel`, `akai_wire`, `akai_moq`, `akai_net` |
| `publish` | 9 | `akai_brief`, `akai_narrate`, `akai_pack`, `akai_distribute` |
| `substrate` | 17 | `akai_capability`, `akai_space`, `akai_compress` |

## Named Prompts

| Prompt | Description |
|---|---|
| `turn-this-call-into-a-deliverable` | audio → transcribe → brief → deliverable |
| `inspect-this-artifact-lineage` | Resolve full Merkle lineage for an artifact |
| `build-a-model-memory-pack` | FPQ compress + roundtrip + export memory pack |
| `compare-these-reasoning-branches` | Dual branch diff with recommendation |
| `generate-client-invoice-from-usage` | Metering records → invoice |
| `produce-wire-device-report` | PCAP → SIP event + device report |
| `run-a-release-gate` | proof validate + manifest verify + SLI auto-run |
| `make-a-client-brief-from-this-audio` | audio → transcript → structured client brief |

## Resources (`aurekai://` URIs)

`aurekai://runtime/capabilities` · `aurekai://queue/stats` · `aurekai://ledger/portfolio`
`aurekai://models` · `aurekai://model-memory` · `aurekai://features/{artifact}`
`aurekai://proof/{id}` · `aurekai://graph/{node}/lineage` · `aurekai://space/{name}`
`aurekai://wire/{capture_id}` · `aurekai://project/{id}` · `aurekai://invoice/{id}` · `aurekai://cms/{entry_id}`

## Runtime Requirement

Tools require the `akai` binary on `PATH` (from [aurekai/native-runtime](https://github.com/aurekai/native-runtime))
or set `AKAI_BIN=/path/to/akai`. Without it, tools return a clear error message — no crash.

## Registry Targets

- [Smithery](https://smithery.ai/server/io.github.aurekai/aurekai-mcp)
- [Glama](https://glama.ai)
- [Official MCP Registry](https://mcp.so)
- PulseMCP
