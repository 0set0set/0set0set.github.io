---
title: "Who Owns the Model of You?"
description: "A person-owned architecture for what AI agents are allowed to know about you — claims, provenance, consent, and portability, exposed to agents over MCP."
date: 2026-06-22
category: essay
keywords:
  - AI agents
  - agent personalization
  - self model
  - privacy
  - contextual integrity
  - data provenance
  - consent
  - local-first software
  - Model Context Protocol
  - personal data ownership
---

A *self model* is a person-controlled, contextual collection of claims an AI
agent may consult, with consent, to personalize its behavior. It is not a full
identity, not an objective account of a person, and not a profile owned by a
platform. *[Alma](https://github.com/almakit/alma)* is my experiment in owning
and governing that model outside any single product.

Agents are getting better at tools and memory, but the model they build of a
person usually stays trapped where it was created: inferred opaquely, weakly
portable, and hard to audit. I think that model should be inspectable,
correctable, portable, contextual, consented, and controlled by the person it
describes.

Alma approaches the problem with a small architectural core: claims, provenance,
grants, temporary readings, audit events, inspection and correction, and schema
versioning. The current Rust prototype is narrower and more concrete: event-log
`Event`s, projected `Facet`s, scope-based grants, consent-filtered readings,
always-on reconciliation with numeric confidence, a signed export bundle, and
conformance fixtures. The contribution is the composition, not a new
cryptographic primitive or identity standard.

The limits matter. Signatures prove origin and integrity, not truth. Access
control governs disclosure, not downstream retention. And there is no evidence
yet that Alma makes agents more useful. The evaluation in this essay is a plan
for testing that hypothesis, not a result.

<aside class="key-takeaways" aria-label="Key takeaways">
  <p class="key-takeaways__title">Key takeaways</p>
  <ul>
    <li>A <strong>self model</strong> is a person-controlled, contextual set of claims for agent personalization — not a platform-owned profile, and not a full identity.</li>
    <li>Memory records <em>what happened</em>; a self model represents <em>how a person works</em>, with provenance, context, uncertainty, and consent.</li>
    <li><strong>Alma Core</strong> is small as an architecture; the current Rust prototype uses a narrower 2026-06 wire format built from events, facets, grants, readings, and signed bundles.</li>
    <li>Access control governs <em>disclosure</em>: a signature proves origin and integrity, not truth, and nothing controls data after it is disclosed.</li>
    <li>That a person-owned model improves agents is a <strong>hypothesis</strong>; this essay proposes a concrete first experiment, not results.</li>
  </ul>
</aside>

## 1. Introduction

Every conversation with an AI starts the same way: with me explaining myself
again.

Who I am. How I work. How I like answers — short when the question is simple,
detailed when the system is complex. What I am building, and why. I type it into
a new chat, paste it into a "custom instructions" box, or repeat it because the
last assistant that learned it lives inside another company's product.

We have taught machines to reason. We still keep making them meet me as a
stranger.

This is more than an inconvenience. As agents gain autonomy — booking, buying,
drafting, deciding — the model they use to act for a person becomes
infrastructure. And here is the uncomfortable part: platforms will build that
model whether or not we design for it. They already infer preferences and
patterns. The question is not *whether* a person gets modeled. The question is
*who controls the model, who can see it, and who can move or delete it.*

The argument runs in seven steps. (1) Useful agents need some model
of the person they serve. (2) Platforms inevitably build such models. (3) Those
models are usually opaque, platform-bound, and hard to audit. (4) Simple memory —
transcripts, vectors, a free-text profile — does not fix this, because it does
not separate durable preferences from passing mood, verified facts from guesses,
or shareable context from private values. (5) A person-controlled alternative is
possible, in which the model is inspectable, correctable, portable, contextual,
and consented. (6) Alma is an experimental attempt at that alternative. (7) The
risks remain significant, and the central benefit is still a hypothesis that has
to be tested.

The thesis is normative and technical at once:

> If an AI agent builds a model of a person, that model should be inspectable,
> correctable, portable, contextual, consented, and controlled by the person it
> describes.

This essay combines a reference architecture, an experimental implementation, a
proposed interoperable surface, and a research agenda. It is not a standard, a
validated result, or a privacy guarantee.

## 2. The Structural Problem

The difficulty is not a missing feature. It is structural.

- **Agent memory is fragmented.** What one assistant learns rarely transfers
  cleanly to another.
- **Platform models are opaque.** Systems infer a great deal, but the person
  typically has limited inspection, correction, provenance, and export.
- **Custom instructions are too flat.** They help, yet they collapse context,
  scope, temporality, and evidence into one block of text.
- **Transcript and vector memory are undifferentiated.** They can retrieve what
  was said, but they do not, on their own, distinguish a standing preference from
  a one-off request, or a verified fact from an agent's guess.
- **Consent is underspecified.** "Use memory" is not "disclose these claims to
  this reader, for this purpose, for this long."

The deeper risk is not that agents forget us. It is that they remember us in
places we cannot inspect, correct, export, or constrain — and that this becomes
the default precisely as agents gain the autonomy to act on what they remember.

## 3. Memory Is Not a Person Model

It is worth stating the distinction the rest of the argument depends on.

*Memory* answers **what happened**: a message was sent, a link was clicked, a
value was stored on Tuesday. A *person model* tries to answer a harder question:
**how does this person work, and what is an agent allowed to know about it?** Not
"they once asked for a short reply," but "in operational questions they prefer
concision, though in design discussions they want depth."

Storing that I prefer short answers is easy. Representing *how I work*, with
provenance, context, uncertainty, and consent — and letting me inspect and
correct it — is the actual problem. Memory is necessary but not sufficient. A
person model is a different artifact, with different obligations.

## 4. Terminology and Scope

Vague words hide important differences. I use the following terms
deliberately.

- **Person.** The human being. Not reducible to any data structure.
- **Identity.** The broad, contested set of attributes that make someone who
  they are. Alma does **not** attempt to capture this.
- **Profile.** A typically platform-held, often opaque representation used for
  targeting or personalization.
- **Memory.** A store or retrieval mechanism over past events or text.
- **Context.** The situation in which information is appropriate: a purpose, a
  relationship, a moment.
- **User model.** A system's internal representation of a user, often implicit
  and prediction-oriented (as in recommender systems).
- **Claim store.** A structured, queryable set of typed assertions with metadata.
- **Self Model.** The term this project uses for *a person-controlled, contextual
  collection of claims intended for agent personalization.* It is explicitly not
  the person's complete, true, or objective identity.

Why "Self Model" rather than "profile" or "memory"? Because *profile* connotes
something the platform owns and the person cannot see, and *memory* connotes an
undifferentiated log. The point of the term is ownership and structure: a model
*of* the self, *held by* the self, that an agent may consult with permission.
The term is a convenience, not a claim to capture anyone's essence. Where
"Self Model" feels too philosophically loaded, read it as "person-controlled
claim store for agents."

**In scope:** representing claims for agent personalization; provenance;
contextual, consented disclosure; portability; auditability.

**Out of scope:** authentication and identity issuance; psychological diagnosis;
guaranteeing the truth of claims; controlling data after disclosure; inferring
sensitive traits automatically.

## 5. Design Goals and Non-Goals

**Goals.** User control (inspect, correct, reject, delete, export, revoke);
selective, purpose-scoped disclosure; first-class provenance; auditability;
portability; interoperability; uncertainty preservation; implementation
independence.

**Non-goals.** Determining objective identity; psychological diagnosis;
guaranteeing truth; preventing all downstream retention; replacing
authentication or credential issuers; centralizing all personal data;
automatic sensitive inference; making every attribute portable across every
context.

Stating the non-goals is not modesty. It is scoping. A system that tries to solve
identity, authorization, cryptography, synchronization, inference, consent, and
psychology at once solves none of them well.

## 6. Related Work

Alma is a composition of existing ideas. For each field below: what it solves,
what Alma reuses, what Alma adds, and what Alma does not solve.

**Local-first software.** Solves: data ownership without losing
collaboration.[^localfirst] Reuses: the person's copy is primary. Adds: claims,
provenance, and consent semantics for agents. Does not solve: what an agent is
allowed to read.

**Personal data stores (Solid Pods).** Solve: user-controlled storage with
access boundaries.[^solid] Reuses: person-held data. Adds: an agent-facing,
purpose-scoped reading model. Does not solve: how a person model is represented
or reconciled.

**Self-sovereign identity / verifiable credentials.** Solve: identifier control
and issuer-holder-verifier proofs.[^ssi][^vc] Reuses: portability, signing,
verification. Adds: handling for non-credential, inferred, contextual claims.
Does not solve: most self-model claims are not credentials, and a signature does
not make "prefers concise writing" true.

**Object-capability security.** Solves: authority as unforgeable, delegable
references.[^ocap] Reuses: grants as capability-like, scoped, revocable objects.
Adds: contextual purpose and sensitivity. Does not solve: enforcement after
disclosure.

**Contextual integrity.** Solves: privacy as appropriate information flow per
context.[^ci] Reuses: the conceptual basis of purpose-scoped grants. Adds: a
concrete grant/reading mechanism. Does not solve: making purposes legible and
enforceable for ordinary people.

**Event sourcing.** Solves: state as a replayable projection of an event
log.[^eventsourcing] Reuses: auditability and provenance. Adds: claim-level
review states. Does not solve: confidence calibration or consent UX.

**CRDTs.** Solve: convergence under decentralized updates.[^crdt] Reuses: a path
to future multi-device sync. Adds: nothing yet; sync is an optional extension.
Does not solve: anything in the current core.

**Personal knowledge graphs.** Solve: structured facts and relations.[^kg]
Reuses: typed claims. Adds: provenance, sensitivity, consent, and agent
readings. Does not solve: it should not become a general graph DB without consent
semantics.

**Recommender-system user models / preference learning.** Solve: inferring
interests and preferences from behavior.[^recsys][^preference] Reuses: modeling
preferences under uncertainty. Adds: inspection, correction, refusal, and
contextual scoping. Does not solve: prediction quality is not Alma's aim.

**Retrieval-augmented and long-term agent memory.** Solve: bringing relevant
prior content into context.[^rag] Reuses: the value of recall. Adds: claim
typing, provenance, consent, and temporality. Does not solve: retrieval alone
does not separate durable preference from noise.

**Platform-native AI memory.** Solves: in-product personalization with some
view/delete controls.[^openai-memory] Reuses: the usefulness of memory. Adds:
portability and person control outside any single platform. Does not solve: it
remains platform-bound by design.

A qualified claim, not an absolute one: *I do not know of a widely adopted, open,
person-controlled standard that combines provenance-aware claims, purpose-scoped
agent readings, portability, and transparent reconciliation.* Where this survey
is incomplete, treat it as a claim needing further bibliographic validation, not
a settled result.

## 7. Alma Core

A recurring failure of ambitious systems is trying to be everything. Alma
separates a small mandatory core from optional extensions.

**Alma Core (mandatory).**

1. **Claims** — typed assertions with metadata.
2. **Provenance** — the origin and transformation history of every claim.
3. **Grants** — contextual, purpose-scoped authorizations to disclose.
4. **Readings** — temporary, consent-filtered views for a reader.
5. **Audit events** — a log of disclosures and policy decisions.
6. **Inspection and correction** — the person can view, confirm, correct, and
   reject claims.
7. **Schema versioning** — wire artifacts and implementations report a version;
   richer per-artifact versions remain a protocol goal.

**Optional extensions.** Verifiable credentials; CRDT synchronization; external
identity providers; policy attestation; downstream retention commitments; and
selective or encrypted export bundles. Some features that are optional at the
protocol level already exist in the Rust prototype: automated reconciliation,
numeric confidence scoring, Lenses, signed export bundles, and conformance
fixtures.

**Compatibility.** An implementation is *Alma Core compatible* if it can: store
typed claims or facets with provenance; evaluate a grant; produce a
consent-filtered, expiring reading; write audit events; let the person inspect,
correct, and reject or contradict claims; and report its wire/schema version.
Everything else is negotiable.

This separation matters because it lets hard, unsolved research — calibrated
confidence, consent UX, interoperability, retention, and synchronization — sit
outside the part that must be simple and dependable. The prototype makes some of
these research questions executable before the protocol is stable.

### 7.1 Architecture

The main data flow:

```text
User assertions     Agent observations     External credentials
        \                  |                       /
         \                 |                      /
          \                v                     /
           +----------> Signals <---------------+
                           |
                           v
                       Event log            (append-only; signed when exported)
                           |
                           v
                    Reconciliation          (implemented in the Rust prototype)
                           |
                           v
                        Claims              (current projection)
                           |
                           v
                   Grant evaluation         (reader, purpose, scope, sensitivity)
                           |
                           v
              Consent-filtered Reading      (temporary, minimized)
                           |
                           v
                         Agent
```

The person's control loop runs alongside it:

```text
Inspect  ->  Confirm  ->  Correct  ->  Reject  ->  Revoke
```

- **Inspect**: see any claim and its provenance.
- **Confirm**: mark a claim as endorsed, raising its review state.
- **Correct**: replace a claim's value; the old value stays in history.
- **Reject**: in the richer protocol, mark a claim inactive while preserving its
  history; in the current prototype, rejecting a hypothesis adds contradictory
  evidence and proposal denials remain in the log.
- **Revoke**: invalidate a grant, key, or bundle for future disclosure.

## 8. Claim and Provenance Model

The current Rust prototype groups projected state into Facets over canonical
dimension namespaces: `person`, `identity`, `life`, `principles`, `values`,
`craft`, `prefs`, `spirituality`, `core`, `dynamics`, `state`, `style`, and
`narrative`. These are convenient namespaces, **not** a settled ontology.

In the shipped `2026-06` wire format, a Facet is narrower than the richer claim
model below. It is essentially a projected `dimension -> value` with
`subject_id`, `value_type`, numeric `confidence`, lifecycle `status`
(`hypothesis`, `active`, or `contested`), `evidence_mass`, `updated_at`, and an
optional contested `alternative`. Facets are not edited directly; they are
rebuilt by replaying an append-only event log.

The broader protocol design may later carry: `claim_id`, `subject`,
`predicate`, `value`, `claim_type`, `namespace`, `context`, `source`,
`provenance`, `evidence`, `confidence_state` (and optional numeric
`confidence`), `temporal_validity`, `sensitivity`, `review_status`,
`revocation_status`, and `schema_version`.

Claims differ by **how they came to exist**, and this must never be flattened:
user-asserted, behaviorally inferred, agent-suggested, imported, externally
verified, derived (from multiple signals), confirmed, rejected, contested, and
expired. In the current prototype, sources are represented through events such
as `alma_report`, `agent_observation`, `behavior`, and `prior:<lens_id>`.
Rejection is not yet a first-class claim lifecycle state; it is represented by
proposal denial or contradictory evidence. The design intent remains that a
rejected assertion should not simply disappear, because the system should be able
to explain why it is not active and avoid re-learning it.

Target claim example 1 — a contextual communication preference:

```json
{
  "claim_id": "clm_2f9c",
  "subject": "person:self",
  "predicate": "prefers_response_style",
  "value": { "style": "concise", "when": "simple or operational questions" },
  "claim_type": "preference",
  "namespace": "prefs.communication",
  "context": ["coding", "daily_work"],
  "source": "user_asserted",
  "provenance": ["evt_884", "evt_901"],
  "evidence": ["sig_17", "sig_22"],
  "confidence_state": "confirmed",
  "temporal_validity": { "valid_from": "2026-06-18", "valid_until": null, "decay": "slow" },
  "sensitivity": "low",
  "review_status": "confirmed",
  "revocation_status": "active",
  "schema_version": "alma.claim.v0"
}
```

Target claim example 2 — a temporary state / constraint:

```json
{
  "claim_id": "clm_7a31",
  "subject": "person:self",
  "predicate": "current_focus",
  "value": { "state": "preparing a product launch", "implies": "prefer terse, status-style help" },
  "claim_type": "temporary_state",
  "namespace": "state.current",
  "context": ["work"],
  "source": "user_asserted",
  "provenance": ["evt_1180"],
  "evidence": ["sig_64"],
  "confidence_state": "supported",
  "temporal_validity": { "valid_from": "2026-06-18", "valid_until": "2026-07-02", "decay": "fast" },
  "sensitivity": "medium",
  "review_status": "unreviewed",
  "revocation_status": "active",
  "schema_version": "alma.claim.v0"
}
```

### 8.1 Provenance

Provenance should not be a single opaque field. In the current prototype,
`explain` reports how a facet's confidence was built by source and weight,
without exposing raw evidence. A fuller provenance chain should answer: who
originated the signal, when, in which context, through which agent or process, at
what authentication level, what transformations occurred, what human review
occurred, and whether the claim was confirmed, contested, or rejected.

Five properties are routinely confused and must be kept apart:

- **Origin** — where a claim came from.
- **Integrity** — that it has not changed since it was recorded or signed.
- **Authenticity** — that it genuinely came from the stated source.
- **Authority** — whether that source is entitled to assert this kind of claim.
- **Truth** — whether the claim is actually correct.

A signature can establish integrity and origin. It does not establish truth.
Authority depends on claim type: a university can authoritatively assert a degree;
it cannot authoritatively assert that you "dislike detail." An external
credential never licenses behavioral generalization.

## 9. Grants and Readings

A **Grant** authorizes Alma to disclose a bounded view. It is access control, not
a behavioral guarantee.

In the current `2026-06` wire format, a grant carries `grant_id`, `scopes`,
`purpose`, optional `ttl`, `include_hypotheses`, `exclude_dimensions`, and
`issued_at`. Scopes are layer/action strings such as `alma.prefs.read`,
`alma.observe`, `alma.propose`, `alma.behavior`, and `alma.report`. Robust reader
authentication, reader-bound grants, sensitivity ceilings, retention commitments,
delegation, allowed transformations, and per-grant `schema_version` are not yet
implemented.

A fuller grant model could carry reader identity; authentication method;
declared purpose; scope; context; duration; sensitivity ceiling; excluded
predicates; allowed transformations; retention commitment; delegation; audit
requirements; revocation status; and schema version.

Target grant example:

```json
{
  "grant_id": "grant_42",
  "reader": { "id": "agent:example-coding-assistant", "auth_method": "local_mcp_key" },
  "purpose": "coding_assistance",
  "scope": { "namespaces": ["prefs.communication", "craft.engineering"], "sensitivity_ceiling": "medium" },
  "excluded_predicates": ["health_status", "family_details"],
  "context": ["software_engineering", "local_workspace"],
  "duration": "PT2H",
  "allowed_transformations": ["summarize", "rank_by_relevance"],
  "retention_commitment": "do_not_store_beyond_session",
  "delegation": "none",
  "audit": "log_disclosure",
  "revocation_status": "active",
  "schema_version": "alma.grant.v0"
}
```

Purpose deserves care. **Declared purpose** is what the reader claims. **Observable
purpose** is what it actually does. **Enforceable restrictions** are the subset
Alma can check. Today that subset is narrower than the target model: grant
existence, revocation, expiry, scopes, exclusions, and whether hypotheses may be
included. Sensitivity metadata exists in the dimension registry, but it is not
yet a general read-time policy engine.
**Contractual commitments** (retention) are promises Alma can surface or record
in a future protocol, but cannot verify. A reader can lie about purpose.
"Purpose-scoped" is a useful boundary, not a guarantee.

This is a structural limit, stated plainly:

| Phase | What Alma can do | What Alma cannot do |
| --- | --- | --- |
| Before disclosure | Deny, minimize, filter, aggregate, redact, require a valid grant or admin surface, log the decision | Read the reader's true intent |
| After disclosure | Revoke future access, audit, prefer stronger identities next time | Control retention, copying, correlation, or secondary use |

A **Reading** is the temporary, minimized result of a satisfied grant. In the
current implementation it is an ephemeral JSON response with `reading`,
`issued_for`, `grant_id`, optional `focus`, `motivators`, `watch_outs`,
`contested`, `excluded_dimensions`, a `facets` map, one-hour `ttl`, and
`do_not_store: true`. The `ttl` is advisory metadata for the consumer; Alma does
not maintain a server-side reading registry. Successful reads append separate
`view_served` audit events.

Target reading example:

```json
{
  "reading_id": "reading_789",
  "reader": "agent:example-coding-assistant",
  "purpose": "coding_assistance",
  "expires_at": "2026-06-18T22:00:00Z",
  "claims": [
    {
      "predicate": "prefers_response_style",
      "value": { "style": "concise", "when": "simple questions" },
      "context": ["coding"],
      "confidence_state": "confirmed",
      "provenance_summary": "user_asserted_and_confirmed",
      "sensitivity": "low"
    }
  ],
  "policy": { "retention_commitment": "do_not_store_beyond_session", "delegation": "none" },
  "audit": { "disclosure_event": "evt_1201" },
  "schema_version": "alma.reading.v0"
}
```

## 10. Reconciliation and Uncertainty

Reconciliation and confidence are research problems, but the Rust prototype
already includes an always-on deterministic reconciler. Every replay projects the
event log into current Facets. The implementation uses numeric `confidence`
values (`0.0` to `1.0`) plus three lifecycle states: `hypothesis`, `active`, and
`contested`.

Those numbers should not be read as calibrated probabilities. They are
operational confidence signals derived from source weights, evidence mass,
contested alternatives, and explicit decay events. A richer protocol may later
prefer explainable states such as `unreviewed`, `weak`, `supported`,
`confirmed`, `contested`, `rejected`, and `expired`, or combine states with
calibrated numbers after empirical validation. Confidence reflects source type,
recency, human review, and contextual fit; it does not measure truth; and
contradictions should remain visible rather than averaged into false precision.

A transparent target baseline considers source type and authentication, explicit
versus inferred, context, recency and temporality, human review, sensitivity,
contradictions, malicious or revoked sources, duplicate evidence, and dependence
between signals:

```text
function reconcile(signal, store):
    if revoked(signal.source) or failed_auth(signal):
        quarantine(signal); return

    if duplicate_of_existing_evidence(signal, store):
        note_duplicate(signal); return            # avoid double-counting

    candidates = match(store, signal.subject, signal.predicate, signal.context)

    if signal.sensitivity == "high" and signal.source != "user_asserted":
        stage_for_review(signal); return          # refuse silent sensitive inference

    state = derive_state(
        source_type   = signal.source,            # asserted > verified > inferred > suggested
        authenticated = signal.auth_ok,
        explicit      = signal.is_explicit,
        recency       = age(signal.timestamp),
        reviewed      = signal.human_review)

    upsert_claim(candidates, signal, state, scope_to=signal.context)
    preserve_conflicts(candidates)                # keep contradictions visible
    append_audit(signal, candidates, state)
```

**Worked example.** (1) I assert: "I prefer concise answers." (2) In simple
operational questions, I reward short answers. (3) In distributed-systems design,
I ask for depth. (4) An agent proposes the global trait "dislikes detail."

A naive system collapses this into one misleading global trait. In the fuller
protocol, Alma should keep three context-scoped claims instead. The current
prototype approximates this with dimension-scoped Facets, source-weighted
signals, hypotheses, and contested alternatives; it does not yet store the exact
`context` field shown here.

```json
[
  { "predicate": "prefers_response_style", "value": "concise", "context": ["simple_questions"], "source": "user_asserted", "confidence_state": "confirmed" },
  { "predicate": "prefers_response_style", "value": "detailed", "context": ["technical_design"], "source": "behavioral_inference", "confidence_state": "supported" },
  { "predicate": "dislikes_detail", "value": true, "context": ["global"], "source": "agent_suggestion", "confidence_state": "rejected" }
]
```

The contradiction is the signal: the real preference is contextual. The incorrect
global generalization is rejected but kept in history so it is not silently
re-learned.

**When to refuse.** The system should decline to infer when a claim is sensitive
and only weakly supported, when inference would generalize a credential beyond its
authority, or when the only evidence comes from an unauthenticated or low-trust
source. Refusing to infer is a feature.

## 11. Portability and Integrity

A portable **bundle** lets a person move a self model between agents or
implementations. The current prototype implements this as a compact Ed25519 JWS
containing bundle metadata and the full event log; import verifies the signature,
rejects tampering, checks the bundle schema version, and replays events into the
projection. It is a full export, not a minimized Reading.

A fuller bundle format may contain schema version, exported claims, provenance
(full or redacted), grant metadata, revocation state, issuer and signing-key
metadata, an integrity signature, selective export controls, and an optional
encryption envelope.

Signatures establish that a bundle was produced by a key and not altered since.
They do **not** establish that the claims are true, that the person still endorses
them, that the source was honest, or that a recipient will honor retention. And
portability cuts both ways: a self you can carry is also a self an employer or
platform can *demand*. The bundle format must be designed with coercion in mind
(selective and minimal export, encryption).

## 12. Threat Model

Assets at risk: claims, provenance, policies, keys, metadata, and the person's
future autonomy. Threats are prioritized and classified, not merely listed.

| Threat | Asset | Adversary | Attack path | Mitigation | Residual risk |
| --- | --- | --- | --- | --- | --- |
| Platform capture | Whole model | Dominant platform | Proprietary, non-portable memory | Local-first, export, open schema | Convenience still wins markets |
| Malicious reader | Disclosed claims | Hostile agent | Over-broad request, lies about purpose, retains data | Narrow grants, minimization, audit, future reader identity | No control after disclosure |
| Compromised device | Store, keys | Local attacker/malware | Read store, steal keys | File permissions, key rotation, future encryption/keychain integration | Local compromise is severe |
| Sensitive inference | Inferred traits | Reader or Lens | Generalize weak signals | Review gating, refusal, sensitivity ceiling | Imperfect detection |
| Correlation | Cross-context claims | Aggregator | Combine low-sensitivity claims | Context separation, minimization | Hard to prevent post-disclosure |
| Signal poisoning | Claims | Malicious source | Inject biased signals | Provenance, quarantine, conflict preservation | Subtle poisoning resembles real data |
| Key theft / impersonation | Identity, bundles | Thief | Sign as the person | Rotation, revocation, hardware keys | Recovery is hard |
| Coerced export | Bundle | Employer, state | Demand the self | Selective/encrypted export | Technical means cannot solve coercion |
| Consent fatigue | Consent quality | Mundane pressure | Approve everything | Safe defaults, templates, progressive disclosure | Usable consent is unsolved |
| Metadata leakage | Existence of claims | Observer | Read denials/traffic | Careful errors, uniform denial | Traffic analysis persists |

**Classification.** *In scope and addressed:* platform capture, malicious reader
(before disclosure), sensitive inference, signal poisoning. *Partially
mitigated:* correlation, consent fatigue, key theft, metadata leakage. *Explicitly
out of scope:* downstream retention enforcement, coercion, and full protection of
a compromised device.

## 13. Experimental Implementation

It helps to separate four layers that are easy to conflate.

- **Alma implementation.** A local-first, event-sourced server written in Rust,
  with an MCP interface, SQLite event store, deterministic reconciliation,
  scope-based grants, consent-filtered readings, audit events, Lenses, a CLI,
  and a Companion TUI. Experimental.
- **Alma protocol surface.** The current `2026-06` wire artifacts include event,
  grant, reading, export-bundle, lens-input, and lens-manifest schemas, plus
  behavioral conformance fixtures. The richer claim/provenance model described
  above is a protocol direction, not the current wire format.
- **Alma bundle.** The current export format is a signed Ed25519 compact JWS over
  the full event log. Selective export, encryption envelopes, and bundle
  revocation metadata remain future work.
- **Research layer.** Confidence calibration, consent UX, interoperability,
  privacy evaluation, and more complete reconciliation semantics — the open
  problems.

**Status.** Implemented or prototyped: local-first event store, projected
Facet records, an MCP access surface, agent/admin tool separation, scoped
readings, grant-gated disclosure, read audit, proposal/approval-token writes,
deterministic reconciliation, numeric confidence, Lenses, signed export/import
bundles, JSON Schemas, and behavioral conformance fixtures. Not yet done: robust
reader authentication, production-grade key custody, multi-device sync,
verifiable credentials, encryption envelopes, selective export, formal version
negotiation, independent-implementation tests, calibrated confidence, and
downstream retention mechanisms. No adoption, benchmarks, or user studies are
claimed.

## 14. Evaluation Plan

I claim no results. What follows is the *first* experiment I would actually run,
not a wish list of metrics.

- **Primary hypothesis (H1).** For recurring personal tasks, agents given an Alma
  Reading require less repeated briefing and produce more contextually consistent
  output than agents given weaker memory, without disclosing more than necessary.
- **Null hypothesis (H0).** Alma Readings show no improvement over a simple
  profile document on repeated briefing and contextual consistency.
- **Baselines.** (1) No memory; (2) static custom instructions; (3) transcript
  retrieval; (4) a simple profile document; (5) Alma Reading.
- **Tasks.** Recurring coding, writing, research, and planning prompts, run across
  sessions to test persistence and context-switching.
- **Primary metrics.** Repeated-briefing rate (how often the user must restate
  preferences) and contextual consistency (does the agent respect context-scoped
  preferences). **Secondary:** task success, user-rated usefulness, unnecessary
  disclosure per task, correction effort, claim accuracy, and perceived control.
- **Bias risks.** Author-run studies, small samples, prompt cherry-picking,
  novelty effects, and evaluator bias; mitigated by pre-registration, blinded
  scoring, and held-out task sets.
- **Falsification.** If Alma does not reduce repeated briefing or improve
  contextual consistency versus the profile-document baseline — or if it does so
  only by disclosing materially more — H1 is not supported.

The goal is not to show Alma wins. It is to learn whether a person-owned model
helps *without* becoming another surveillance surface.

## 15. Limitations and Open Questions

The ontology is unsettled; the Facet categories and canonical dimensions may be
wrong. Consent is hard: a precise grant model does not guarantee human
understanding. Reconciliation is hard: numeric confidence can look rigorous while
hiding assumptions, so uncertainty and contradiction must stay visible. Local
storage is not ownership by itself —
ownership is the *operational* ability to inspect, correct, reject, delete,
export, selectively disclose, revoke, see provenance, control keys and policies,
migrate implementations, and refuse inference. Revocation stops future
disclosure, not prior retention. Portability can be coerced. The implementation
is a research instrument, not a proof.

Open questions: How should conflicting evidence update confidence? Which claims
should be portable across contexts and which should stay local? How can an agent
*prove* compliance with retention or revocation? Can independent implementations
produce compatible Readings? When should the system refuse to infer? What is the
right default for claims that are useful but sensitive?

## 16. Research Agenda

Near term: publish the richer claim/provenance schema; make provenance
inspection more complete; define denial, revocation, and version-negotiation
error semantics; grow conformance tests; document what is implemented versus
aspirational. Medium term: independent client/server interop tests; a usability
study of grants and correction; CRDT-based sync; selective/encrypted export,
bundle revocation, and production key custody; baseline comparison from Section
14. Long term: separate
Alma-the-implementation from Alma-the-protocol; norms for refusing sensitive
inference; and a longitudinal study of whether person-owned models stay useful
without becoming behavioral capture by another name.

## 17. Conclusion

I started from a small frustration: I was tired of explaining myself again. The
deeper issue is not convenience but control. Agents will be given models of us;
the open question is whether those models are inspectable, correctable, portable,
contextual, consented, and person-controlled — or proprietary by default.

Alma is one experimental answer: a small architectural core (claims or facets,
provenance, grants, readings, audit, inspection, versioning) plus a narrower Rust
prototype that makes some of those ideas executable today. Its contribution is
the composition, not any single primitive, and several of its abstractions will
likely be wrong. That is acceptable for a prototype whose purpose is to make the
design concrete.

So the title is a real question, not a slogan: *who owns the model of you?* My
position is that the person should — but I am treating that as a normative and
technical hypothesis to be implemented and tested, starting with the experiment
in Section 14, not as a conclusion already earned.

[^localfirst]: Martin Kleppmann, Adam Wiggins, Peter van Hardenberg, and Mark McGranaghan. "Local-first software: you own your data, in spite of the cloud." *Onward! 2019*, pp. 154-178. doi:10.1145/3359591.3359737. <https://www.inkandswitch.com/essay/local-first/>
[^mcp]: Model Context Protocol. "What is the Model Context Protocol (MCP)?" <https://modelcontextprotocol.io/docs/getting-started/intro>
[^eventsourcing]: Martin Fowler. "Event Sourcing" (2005). <https://martinfowler.com/eaaDev/EventSourcing.html>
[^solid]: Solid Project. "About Solid." <https://solidproject.org/about>
[^ssi]: Christopher Allen. "The Path to Self-Sovereign Identity" (2016). <https://www.lifewithalacrity.com/article/the-path-to-self-soverereign-identity/>
[^vc]: W3C. "Verifiable Credentials Data Model." <https://www.w3.org/TR/vc-data-model/>
[^ci]: Helen Nissenbaum. "Privacy as Contextual Integrity" (2004); *Privacy in Context* (2010). <https://digitalcommons.law.uw.edu/wlr/vol79/iss1/10/>
[^ocap]: Mark S. Miller. "Robust Composition: Towards a Unified Approach to Access Control and Concurrency Control" (PhD thesis, 2006). <https://papers.agoric.com/papers/robust-composition/abstract/>
[^crdt]: Marc Shapiro, Nuno Preguica, Carlos Baquero, and Marek Zawirski. "Conflict-free Replicated Data Types." *SSS 2011*. doi:10.1007/978-3-642-24550-3_29. <https://doi.org/10.1007/978-3-642-24550-3_29>
[^kg]: Aidan Hogan et al. "Knowledge Graphs." *ACM Computing Surveys* 54, no. 4 (2021). doi:10.1145/3447772. <https://ris.uni-paderborn.de/record/24720>
[^recsys]: Francesco Ricci, Lior Rokach, and Bracha Shapira, eds. *Recommender Systems Handbook*, 3rd ed. Springer, 2022. doi:10.1007/978-1-0716-2197-4. <https://doi.org/10.1007/978-1-0716-2197-4>
[^preference]: Johannes Furnkranz and Eyke Hullermeier, eds. *Preference Learning*. Springer, 2010. doi:10.1007/978-3-642-14125-6. <https://doi.org/10.1007/978-3-642-14125-6>
[^rag]: Patrick Lewis et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." *NeurIPS 2020*. <https://arxiv.org/abs/2005.11401>
[^openai-memory]: OpenAI. "Memory and new controls for ChatGPT." <https://openai.com/index/memory-and-new-controls-for-chatgpt/>
