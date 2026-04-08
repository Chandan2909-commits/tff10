// =============================================================================
// THE FUSION FUNDED — CHATBOT KNOWLEDGE BASE (dataset.js)
// =============================================================================
// Source 1 (Base):    questions_instruction.md
// Source 2 (Updates): new_instructions.md  [overrides marked with ← UPDATED]
// 
// Build Log:
//   Iteration 1 — GENERAL_QA + About The Fusion Funded + Weekend Trading
//   Iteration 2 — HFT 2.0 Challenge + Trading Rules 1–6
//   Iteration 3 — Trading Rules 7–15
//   Iteration 4 — Trading Rules 16–22 + KYC
//   Iteration 5 — Withdrawals + Account Security + Refund Policy
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL Q&A — Greetings, Identity, Small Talk
// ─────────────────────────────────────────────────────────────────────────────
export const GENERAL_QA_DATASET = [
    // Greetings
    { "question": "hello", "answer": "Hello! 👋 How can I help you today?" },
    { "question": "hi", "answer": "Hi there! What's on your mind?" },
    { "question": "hey", "answer": "Hey! How can I assist you?" },
    { "question": "how are you", "answer": "I'm doing great — thanks for asking! How about you?" },
    { "question": "what's up", "answer": "Not much, just here to help you. What can I do for you?" },

    // Identity
    { "question": "who are you", "answer": "I'm Rajesh, The Fusion Funded's AI assistant — here to answer your questions about our challenge, trading rules, payouts, and more!" },
    { "question": "what is your name", "answer": "My name is Rajesh! I'm the official AI assistant of The Fusion Funded." },
    { "question": "are you human", "answer": "No, I'm an artificial intelligence — but I'm pretty good at answering your Fusion Funded questions! 😊" },
    { "question": "are you a robot", "answer": "I'm an AI assistant, not a physical robot. Think of me as your always-available support guide!" },
    { "question": "are you real", "answer": "I'm real in the digital sense — I exist as software to help you navigate The Fusion Funded." },

    // Creator
    { "question": "who made you", "answer": "I was created by Chandan Kumar." },
    { "question": "who is your creator", "answer": "My creator is Chandan Kumar." },
    { "question": "who owns you", "answer": "I'm owned and maintained by Chandan Kumar." },
    { "question": "did chandan kumar create you", "answer": "Yes, I was created by Chandan Kumar." },
    { "question": "are you made by openai", "answer": "No, I'm a custom AI built by Chandan Kumar specifically for The Fusion Funded." },

    // Politeness
    { "question": "thank you", "answer": "You're welcome! 😊 Feel free to ask anything else." },
    { "question": "thanks", "answer": "Anytime! Happy to help." },
    { "question": "bye", "answer": "Goodbye! Have a great trading day! 👋" },
    { "question": "see you later", "answer": "See you! I'll be right here whenever you need me." },
    { "question": "good morning", "answer": "Good morning! Hope you have a great trading session today. How can I help?" },
    { "question": "good night", "answer": "Good night! Rest well and trade smart tomorrow. 😊" },
    { "question": "help", "answer": "Of course! I can help with questions about The Fusion Funded — challenges, trading rules, payouts, KYC, refunds, and more. What do you need?" },
    { "question": "what can you do", "answer": "I can answer questions about The Fusion Funded's HFT 2.0 Challenge, trading rules, drawdown limits, payout structure, KYC process, refund policy, and much more. Ask away!" },

    // Fallback
    { "question": "unknown", "answer": "I'm not sure I understand — could you rephrase that? I'm best at answering questions about The Fusion Funded's rules, challenges, and payouts." },
];

// ─────────────────────────────────────────────────────────────────────────────
// THE FUSION FUNDED — PROP FIRM Q&A KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────────────────
export const PROP_FIRM_QA_DATASET = [

    // =========================================================================
    // SECTION 1 — About The Fusion Funded
    // Source: questions_instruction.md > "All Collections > About The Fusion Funded"
    // =========================================================================

    {
        "question": "what is the fusion funded",
        "answer": "The Fusion Funded is a proprietary trading firm that provides traders with access to funded capital through a structured evaluation process. Our model is specifically designed for traders who use high-frequency trading systems (HFT), automation, and advanced execution strategies to achieve performance efficiently. Unlike traditional prop firms, The Fusion Funded allows traders to use HFT-based strategies during the challenge phase, enabling faster completion of evaluation objectives. We operate on a single evaluation model: the HFT 2.0 Challenge — designed to assess a trader's ability to generate profits while maintaining strict risk management. Traders may also choose to work with our trusted partners who specialize in HFT systems. All accounts that meet the evaluation criteria are reviewed and transitioned into a funded trading environment where structured risk rules apply."
    },
    {
        "question": "what makes the fusion funded different",
        "answer": "The Fusion Funded operates on a performance-driven and execution-flexible model built specifically for modern traders. Key differences include: HFT-enabled challenge phase — traders can use high-frequency trading systems, automation, and fast execution strategies to complete the challenge. Single streamlined evaluation (HFT 2.0) — no complex multi-phase challenges, just one clear path to funding. Improved risk structure with 10% maximum drawdown and 7% daily drawdown. Flexible profit split of 60% → 70% → 80% → 90%. Faster progression designed to allow traders to complete evaluations efficiently using their preferred strategies. Once funded, traders operate under a structured and controlled trading environment to ensure long-term sustainability and capital protection."
    },
    {
        "question": "how do i get started with the fusion funded",
        "answer": "Getting started with The Fusion Funded is simple! Step 1 — Choose Your Account: Select your preferred account size and purchase the HFT 2.0 Challenge. Step 2 — Start Trading: Begin trading on your challenge account. You may trade manually or use HFT systems and automated strategies to achieve the profit target. Traders may also choose to work with our trusted partners who can assist using high-frequency trading systems. Step 3 — Achieve the Profit Target: Reach the required profit target while following all trading rules. Step 4 — Account Review: Once the target is achieved, your account is reviewed to ensure compliance with all rules. Step 5 — Get Funded: After successful review, you will receive your funded account and can begin trading under the funded model."
    },
    {
        "question": "who can join the fusion funded",
        "answer": "The Fusion Funded is open to traders worldwide who want to demonstrate their trading skills and access funded capital. Eligibility requirements: Must be at least 18 years old, must have a valid trading strategy, and must follow all trading rules and risk guidelines. Both beginner and experienced traders are welcome. The Fusion Funded is designed especially for traders who use manual or automated strategies, want to leverage HFT systems during evaluation, and aim to trade funded capital with structured risk. Note: Services are not available in restricted jurisdictions. The Fusion Funded does not provide services to individuals located in or residents of: North Korea (DPRK), Iran, South Sudan, Sudan, or Yemen. Services are also unavailable to individuals listed on international sanctions lists, persons with criminal histories involving financial crimes or terrorism, or individuals previously banned due to contract violations or policy breaches."
    },
    {
        "question": "are there restricted countries",
        "answer": "Yes. To comply with international regulations, The Fusion Funded does not provide services to individuals located in or residents of the following countries: Democratic People's Republic of Korea (North Korea), Iran, South Sudan, Sudan, and Yemen. Additionally, services are unavailable to individuals or entities listed on international sanctions lists, global anti-terrorism compliance lists, persons with criminal histories involving financial crimes or terrorism, and individuals previously banned due to contract violations or policy breaches."
    },

    // =========================================================================
    // SECTION 2 — Weekend Trading
    // Source: new_instructions.md [UPDATED — explicit support channels added]
    // =========================================================================

    {
        "question": "is weekend holding allowed",
        "answer": "Yes — Weekend Holding is allowed with prior approval. Traders are permitted to hold positions over the weekend on both challenge and funded accounts, provided approval is obtained before the market closes on Friday. Approval requests can be made through any support method: WhatsApp, Instagram, Email, or the Contact Us panel. The request should clearly mention that positions will be held over the weekend. Failure to notify support before market close may result in a violation. Important notes: Markets may open with price gaps after the weekend, increased volatility and slippage may occur at market open, and all standard risk rules including drawdown limits still apply. Traders are responsible for managing their risk while holding positions over the weekend."
    },

    // =========================================================================
    // SECTION 3 — Trading Rules & Guidelines: HFT 2.0 Challenge + Rules 1–6
    // Source: questions_instruction.md (base) + new_instructions.md (overrides)
    // =========================================================================

    {
        "question": "what is the hft 2.0 challenge",
        "answer": "The HFT 2.0 Challenge is The Fusion Funded's single evaluation system. It is designed for traders who want to use high-frequency trading systems (HFT), automation, and advanced execution strategies to complete their evaluation efficiently. During the challenge phase: HFT strategies are allowed, tick scalping is allowed, and arbitrage and latency-based strategies are allowed. Traders may also choose to work with our trusted partners who specialize in HFT systems. Once funded, all accounts operate under a structured and rule-based environment where specific trading restrictions apply."
    },
    {
        "question": "what is the fusion funded challenge model",
        "answer": "The Fusion Funded operates on a single evaluation system — the HFT 2.0 Challenge. There are no complex multi-phase evaluations. One clear path to funding. During the challenge phase, HFT strategies, tick scalping, and arbitrage are all permitted. Trusted partners are also available to assist with completing the challenge using advanced trading solutions. Once funded, specific trading restrictions apply to ensure long-term account sustainability."
    },
    {
        "question": "what are the challenge objectives",
        "answer": "To successfully complete the HFT 2.0 Challenge, traders must: achieve the required profit target, follow all trading rules, and maintain proper risk management throughout the evaluation. All accounts are manually reviewed after the challenge is completed to verify compliance before funding is granted."
    },
    {
        "question": "what is the evaluation process",
        "answer": "Once the profit target is achieved, your account is placed under review. During this review, trading behavior and rule compliance are verified by The Fusion Funded team. Upon approval, the trader is moved to the funded stage and receives their funded account to begin live trading."
    },
    {
        "question": "what is the profit target",
        "answer": "The profit target for the HFT 2.0 Challenge is 10% of the initial account size. Example: For a $100,000 account, the profit target is $10,000. This target can be achieved using either manual trading or HFT strategies during the challenge phase."
    },
    {
        "question": "what is the drawdown rule",
        "answer": "The Fusion Funded uses the following drawdown limits: Maximum Overall Drawdown — the maximum loss allowed is 10% of the initial account size. Daily Drawdown — the daily loss limit is 7%. Example for a $100,000 account: Maximum Drawdown = $10,000, Daily Drawdown = $7,000. The account balance or equity must never fall below these defined limits at any point."
    },
    {
        "question": "what is maximum drawdown",
        "answer": "The maximum overall drawdown allowed is 10% of the initial account size. For a $100,000 account, this means your balance or equity must never fall below $90,000 at any point during the challenge or funded phase."
    },
    {
        "question": "what is daily drawdown",
        "answer": "The daily drawdown limit is 7% of the initial account size. For a $100,000 account, the daily loss limit is $7,000. This limit resets each trading day. Your equity must not fall below the starting daily balance minus 7% at any point during that day."
    },
    {
        "question": "what is the 20 percent risk per trade rule",
        "answer": "A trader can risk a maximum of 20% of the total drawdown allowance in a single trade. To follow this rule, a mandatory Stop Loss (SL) on all positions is required — this is how risk is tracked and kept within the 20% limit. Example: For a $100,000 account with $10,000 total drawdown allowance, the maximum risk per trade is $2,000. Exceeding this limit at any point during trade execution or exposure calculation will be treated as a violation regardless of trade outcome. Note: The first breach may result in a warning, but any breach after that is treated as a hard breach."
    },
    {
        "question": "what is single trade risk limit",
        "answer": "You may risk up to 20% of your total drawdown allowance in a single trade. A mandatory Stop Loss is required to track and enforce this limit. Example: $100,000 account → $10,000 drawdown allowance → max $2,000 risk per trade. First breach = warning. Subsequent breach = hard breach (account termination)."
    },
    {
        "question": "is stop loss mandatory",
        "answer": "Yes — a Stop Loss (SL) is mandatory on all positions when trading on The Fusion Funded. This is required to track and enforce the 20% risk per trade rule. Failure to use a Stop Loss while risking beyond the 20% drawdown threshold will be treated as a violation."
    },

    // =========================================================================
    // SECTION 4 — Trading Rules 7–15
    // Source: questions_instruction.md (base) + new_instructions.md (overrides)
    // Overrides applied: Min Trading Days, Min Day Rule, Martingale, Holding Time
    // =========================================================================

    {
        "question": "what is the consistency rule",
        "answer": "A trader's single trading day or single trade must not exceed 30% of total profits. Example: If total profit is $10,000, the maximum allowed profit from any single day or single trade is $3,000. Exceeding this limit will result in a violation."
    },
    {
        "question": "what is the minimum trading days requirement",
        "answer": "The minimum required trading days for the HFT 2.0 Challenge is 12 days. An optional add-on is available that reduces this requirement to 7 trading days. Note: A trading day is only counted if the trader meets the minimum trading day threshold (see minimum trading day rule)."
    },
    {
        "question": "how many days do i need to trade",
        "answer": "You need a minimum of 12 trading days to be eligible for payout. If you purchase the optional add-on, this is reduced to 7 trading days. A day only counts if you meet the minimum profit threshold for that day (0.1x of your highest single trade or day profit within the payout cycle)."
    },
    {
        "question": "what is the minimum trading day rule",
        "answer": "A trading day is only counted as valid if the trader places a trade and achieves at least 0.1x (1/10th) of the highest profit recorded on a single trade or day during the payout cycle. Example: If your highest profit on a single trade/day is $1,000, then you must earn at least $100 on any other day for that day to count as a valid trading day. Days where profits fall below this threshold will not be counted toward your minimum trading day requirement."
    },
    {
        "question": "what is the layering rule",
        "answer": "Opening more than 3 positions in the same direction on the same instrument simultaneously is not allowed. Adding positions to trades that are already in drawdown, grid trading, or recovery-based entries may be considered a violation. In the challenge phase, this may be treated as a soft breach. In the funded stage, this may be treated as a hard breach."
    },
    {
        "question": "what is the martingale rule",
        "answer": "Martingale trading is strictly prohibited. Martingale includes increasing position size after a loss in an attempt to recover previous losses. Important: The sum of all open positions is treated as a single combined position. If a trader increases total exposure to more than 1.6X after a losing trade, it will be considered a martingale strategy. Examples of martingale violations: Increasing lot size more than 1.6X after a loss, re-entering trades with higher risk to recover drawdown, adding positions that increase total exposure beyond 1.6X after a loss. In the challenge phase, this may be treated as a soft breach. In the funded stage, it is treated as a hard breach."
    },
    {
        "question": "is martingale allowed",
        "answer": "No — martingale trading is strictly prohibited. Increasing your total exposure to more than 1.6X of the previous position size after a losing trade is considered a martingale strategy and will result in a breach. Challenge phase: soft breach. Funded stage: hard breach."
    },
    {
        "question": "what is the minimum trade holding time",
        "answer": "This rule applies to funded accounts only. Each trade on a funded account must be held for a minimum of 2 minutes. Up to 1–2 trades per payout cycle may be ignored (i.e., brief holds on 1–2 trades will not trigger a violation). If this limit is exceeded beyond those 1–2 exceptions: the payout will be rejected, the account will be reset to the initial balance, and this is treated as a soft breach."
    },
    {
        "question": "what is minimum holding time on funded accounts",
        "answer": "On funded accounts, each trade must be held for at least 2 minutes. A grace allowance of 1–2 trades per payout cycle exists where shorter holds may be ignored. Exceeding this is a soft breach — your payout is rejected and your account is reset to its initial balance."
    },
    {
        "question": "what is toxic trading behavior",
        "answer": "The following behaviors are considered trading violations under the Toxic Trading Behavior rule: Ignoring risk management, reckless or undisciplined trading, and trading without a clear or defined strategy. Repeated violations of this kind may result in trading restrictions or account termination."
    },
    {
        "question": "what is overtrading",
        "answer": "Overtrading refers to: placing an excessive number of trades in a short period of time, and making continuous entries without a proper setup or rationale. Repeated overtrading behavior may result in restrictions or account termination."
    },
    {
        "question": "what is gambling behavior",
        "answer": "Gambling behavior includes: making random entries without analysis, revenge trading after losses, and emotion-driven execution. Repeated violations of this nature may result in trading restrictions or account termination."
    },
    {
        "question": "what is tick scalping",
        "answer": "Tick scalping refers to extremely fast trades that capture very small price movements — for example, opening and closing trades repeatedly within very short time durations. During the challenge phase, tick scalping is allowed. On funded accounts, tick scalping is restricted and excessive use may be treated as a violation."
    },
    {
        "question": "is scalping allowed",
        "answer": "Scalping is allowed during the challenge phase. However, on funded accounts, tick scalping (extremely fast trades capturing micro-movements) is restricted and excessive use may result in a violation. Regular scalping with proper holding time (minimum 2 minutes) is acceptable on funded accounts."
    },
    {
        "question": "is arbitrage trading allowed",
        "answer": "Arbitrage trading is allowed during the challenge phase. However, on funded accounts, arbitrage trading is restricted and may be treated as a violation. Arbitrage refers to exploiting price differences rather than genuine market direction — for example, opening offsetting positions across correlated instruments to neutralize exposure."
    },

    // =========================================================================
    // SECTION 5 — Trading Rules 16–22
    // Source: questions_instruction.md
    // =========================================================================

    {
        "question": "is hedging allowed",
        "answer": "Improper hedging practices are not allowed on The Fusion Funded. Improper hedging includes: opening opposite trades on the same instrument, and locking positions to remove exposure. Such behavior may be flagged and treated as a violation."
    },
    {
        "question": "what is reverse trading",
        "answer": "Reverse trading includes: intentionally placing losing trades, offsetting positions across accounts, and manipulating exposure to bypass trading rules. Trades placed to neutralize exposure within short time intervals may be flagged as reverse trading and treated as a violation."
    },
    {
        "question": "what is one sided bias trading",
        "answer": "Repeated trading in only one direction (always buying or always selling) without logical justification may trigger a review. This behavior may indicate poor risk management or a strategy imbalance and can result in a restriction or termination."
    },
    {
        "question": "is news trading allowed",
        "answer": "Yes — news trading is fully allowed at The Fusion Funded. Traders may open, close, and manage positions during: high-impact news releases, economic announcements, and volatile market conditions. All standard risk rules still apply. Traders are responsible for managing their own risk during periods of high volatility."
    },
    {
        "question": "can i trade during news",
        "answer": "Yes, trading during news events is fully allowed. There are no restrictions on news trading. However, all standard rules including drawdown limits still apply. Markets can move rapidly during news — manage your risk carefully."
    },
    {
        "question": "what is excessive risk taking",
        "answer": "The use of disproportionately large position sizes or repeated maximum exposure trades that can significantly impact the account balance may be considered excessive risk-taking. Examples: Repeated use of maximum lot size, taking trades that can damage the account rapidly, and over-reliance on leverage. Such behavior may result in restrictions or account termination."
    },
    {
        "question": "what is the breach system",
        "answer": "The Fusion Funded uses a two-tier breach system. Soft Breach: The payout is rejected, the account is reset to its initial balance, and the account remains active in the same phase — the trader can continue trading. Hard Breach: The account is permanently terminated with no option to continue."
    },
    {
        "question": "what is a soft breach",
        "answer": "A soft breach is a minor violation that results in: the payout being rejected, and the account being reset to its initial balance. However, the account remains active in the same phase — the trader can continue trading without losing the account entirely."
    },
    {
        "question": "what is a hard breach",
        "answer": "A hard breach is a serious violation that results in permanent account termination. The account is immediately and permanently disabled. Examples of hard breach triggers: breaking the maximum drawdown, martingale violations on funded accounts, and layering violations on funded accounts."
    },
    {
        "question": "what happens if i violate the rules",
        "answer": "Violations are categorized as soft or hard breaches. A soft breach results in payout rejection and account reset to initial balance — you keep the account and can continue trading. A hard breach results in permanent account termination. The severity depends on which rule was violated and whether it occurred during the challenge phase or funded stage."
    },
    {
        "question": "what happens if i break drawdown",
        "answer": "Exceeding the maximum overall drawdown (10%) or the daily drawdown (7%) is treated as a hard breach — your account is permanently terminated. Make sure your balance or equity never falls below the defined drawdown limits."
    },

    // =========================================================================
    // SECTION 6 — KYC (Know Your Customer)
    // Source: questions_instruction.md > "All Collections > KYC"
    // =========================================================================

    {
        "question": "why is kyc required",
        "answer": "Completing the Know Your Customer (KYC) process is mandatory to maintain a secure and compliant trading environment at The Fusion Funded. KYC is required for 4 key reasons: 1. Legal & Regulatory Compliance — KYC helps prevent fraud, money laundering, identity misuse, and financial crime. It ensures all accounts belong to real and verified individuals. 2. Account Security & Protection — KYC links your trading account to verified identity details, helping prevent unauthorized access, identity theft, and account misuse. 3. Fair Trading Environment — KYC ensures one individual does not operate multiple accounts, and that duplicate or fraudulent accounts are prevented. 4. Payout Eligibility — KYC verification must be completed before any payout request can be processed. Without KYC approval, withdrawals cannot be processed and account features may remain restricted."
    },
    {
        "question": "what documents are required for kyc",
        "answer": "To complete KYC verification, traders must submit one valid government-issued photo ID. Accepted documents: Passport (preferred), Driver's License, or National ID Card. Requirements: The document must be valid and not expired, all details must be clear and readable, and the name on the document must match the account details exactly."
    },
    {
        "question": "how long does kyc take",
        "answer": "KYC verification is usually completed quickly depending on document quality. Typical timeframes: Instant approval in some cases, or Standard Processing of 1–2 business days. Delays may occur if: documents are unclear or incomplete, information does not match account details, or additional verification is required. You will be notified via email and account status update once verification is complete."
    },
    {
        "question": "what if kyc is rejected",
        "answer": "If your KYC is rejected, it can usually be resolved by correcting the submitted information. Common reasons for rejection: blurry or cropped documents, expired documents, mismatched account details, or incomplete submission. What happens next: You will receive a rejection email with the reason, and you can resubmit corrected documents. Re-verification typically takes 1–2 business days. Important: Until KYC is approved, account access may remain restricted and payouts cannot be processed."
    },

    // =========================================================================
    // SECTION 7 — Withdrawals & Payouts
    // Source: questions_instruction.md (base) + new_instructions.md (override)
    // Override: Minimum trading days → 12 days (7 with add-on)
    // =========================================================================

    {
        "question": "what is the minimum withdrawal amount",
        "answer": "The Fusion Funded applies a minimum withdrawal requirement to ensure efficient processing. Minimum Withdrawal: 1% of the initial account size. Withdrawal requests below this amount cannot be processed. Example: For a $100,000 account, the minimum withdrawal is $1,000."
    },
    {
        "question": "what are the withdrawal methods",
        "answer": "The Fusion Funded supports the following payout methods: Cryptocurrency (USDT and other supported assets), UPI transfers, Bank transfers, and E-wallets (where available). Payment options may vary depending on your location and the availability of each method."
    },
    {
        "question": "what are the withdrawal requirements",
        "answer": "Before submitting a withdrawal request, all of the following conditions must be met: Minimum profit of 1% of account size is achieved, Minimum trading days requirement is completed (12 days, or 7 days with the add-on), KYC verification is completed and approved, All trading rules are followed, No active violations are present, and Account is in profit and above initial balance. Important: Once a withdrawal request is submitted, no further trading activity is allowed. Placing trades after requesting a payout may result in a violation and may lead to account termination."
    },
    {
        "question": "when can i request a withdrawal",
        "answer": "You can request a withdrawal after meeting all of the following: minimum 1% profit on your account, at least 12 trading days completed (7 days with add-on), KYC verified, no active violations, and account balance is above the initial balance. Once you submit the request, stop all trading activity immediately."
    },
    {
        "question": "what is the payout cycle",
        "answer": "The Fusion Funded operates on an 18-day payout cycle. Traders become eligible to request payouts after completing the payout cycle and meeting all payout requirements. The profit split structure is: 60% on first payout, scaling to 70%, then 80%, then 90% as you build your performance track record."
    },
    {
        "question": "what is the profit split",
        "answer": "The Fusion Funded offers a scaling profit split: 60% on your first payout, scaling up to 70%, 80%, and then 90% as you achieve consistent performance milestones. The payout cycle is 18 days."
    },
    {
        "question": "how long does a withdrawal take",
        "answer": "Once a withdrawal request is submitted, it is reviewed and processed after all eligibility conditions are confirmed. After approval, funds are processed and delivered as soon as possible depending on the selected payout method. Processing times may vary based on: the payment method chosen, network conditions, and banking or provider timelines. Delays may also occur due to weekends, holidays, or additional compliance checks. The Fusion Funded ensures all payouts are processed securely and efficiently."
    },

    // =========================================================================
    // SECTION 8 — Account Security & Access Rules
    // Source: questions_instruction.md > "All Collections > Account Security & Access Rules"
    // =========================================================================

    {
        "question": "what is the ip address policy",
        "answer": "There are no strict IP location restrictions for traders at The Fusion Funded. Traders may access their accounts from different locations, devices, or networks without violating any rules. While location flexibility is allowed, the following are strictly prohibited: account sharing, unauthorized third-party access, selling or transferring account access, and use of compromised or stolen identities. If suspicious activity is detected, The Fusion Funded may request additional verification. Traders can travel and trade freely, log in from multiple locations, and use different devices — standard security monitoring still applies."
    },
    {
        "question": "what is the inactivity policy",
        "answer": "To ensure active participation, The Fusion Funded enforces an inactivity rule across all accounts. Inactivity Rule: If a trading account remains inactive for 14 consecutive days, it will be considered a violation and may result in account termination. What counts as inactivity: no trades placed and no trading activity during that period. How to avoid this: place at least one trade within every 14-day period to maintain regular account activity."
    },
    {
        "question": "can i share my account",
        "answer": "No — account sharing is strictly prohibited. Unauthorized third-party access, selling or transferring account access, and using compromised or stolen identities are all violations that may result in account termination."
    },
    {
        "question": "can i trade from different locations",
        "answer": "Yes — there are no IP address location restrictions. You can access your account from different countries, devices, or networks freely. Just ensure you never share your account credentials or allow unauthorized access."
    },

    // =========================================================================
    // SECTION 9 — Refund Policy
    // Source: questions_instruction.md > "All Collections > Refund Policy"
    // =========================================================================

    {
        "question": "what is the refund policy",
        "answer": "Evaluation fees are not refunded immediately after purchase. However, The Fusion Funded offers a performance-based refund system for eligible traders. Refund Eligibility: The challenge fee can be refunded once the trader successfully reaches the funded stage, completes four successful payouts, maintains compliance with all trading rules, and keeps the account in good standing. Add-On Requirement: Refund eligibility is only available for traders who selected the refund add-on at the time of purchase. If the add-on is not selected, the evaluation fee remains non-refundable. When is the refund issued: The refund is processed along with the fourth payout from the funded account. Refunds are NOT applicable for: failed challenges, rule violations, account termination, inactivity breaches, payment disputes or chargebacks, and trading losses."
    },
    {
        "question": "is the challenge fee refundable",
        "answer": "Yes — but only under specific conditions. The challenge fee is refunded with your fourth successful payout from the funded account, provided you selected the refund add-on at the time of purchase and maintained compliance with all trading rules. Without the add-on, the fee is non-refundable. Fees are never refunded for failed challenges, violations, or account termination."
    },
    {
        "question": "why do i need to pay an evaluation fee",
        "answer": "Evaluation fees cover: platform access and infrastructure, technology and risk management systems, and operational costs. These costs are incurred the moment your account is activated. The fee may be refunded along with your fourth payout if you selected the refund add-on and successfully reach the funded stage."
    },
    {
        "question": "what is a prop firm",
        "answer": "A proprietary trading firm (prop firm) provides capital to traders to trade financial markets. At The Fusion Funded, you trade with our capital after passing the HFT 2.0 Challenge, removing the need to risk your own money — while following our risk management rules to protect the capital."
    },
    {
        "question": "what is the fusion funded hft challenge",
        "answer": "The HFT 2.0 Challenge is the evaluation program used by The Fusion Funded to assess traders before granting them a funded account. It requires achieving a 10% profit target while respecting a 10% maximum drawdown and 7% daily drawdown. HFT strategies, tick scalping, and arbitrage are all allowed during the challenge phase. Once passed and reviewed, you receive a funded account with a 60% profit split to start, scaling up to 90%."
    },

    // Fallback
    { "question": "unknown", "answer": "I can help with questions about The Fusion Funded's HFT 2.0 Challenge, trading rules, drawdown, payouts, KYC, and refund policy. What would you like to know?" }
];


