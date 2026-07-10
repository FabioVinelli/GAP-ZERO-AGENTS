# Closed-loop PoC — GAP/ZERO Trading Agent v2.0
- Scope: One strategy class; paper-trade only in cycle 1; live execution gate locked
- Sprint contract: 20 validated signals with full audit trail (evidence+backtest+paper fill+evaluator pass) before scale discussion
- Duration: 4 weeks or 50 runs, whichever comes first
- Success metric: 60% of signals profitable in paper trade within declared risk limits
- KILL criteria (pre-committed): 3 consecutive max-loss breaches OR Sharpe < 0.5 over 20 trades
- Scale criteria: Success metric met + zero critical evaluator failures + full audit coverage
- Review trigger: After 50 runs OR first live-execution request, whichever is earlier
