# Universal Marketing Campaign Workflow - Setup Guide

This guide helps you set up and run the universal marketing campaign workflow for Reddit.

## Quick Start

### 1. Set Up Reddit API Credentials

#### Create Reddit Script App
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: Your bot name (e.g., "marketing-bot")
   - **App type**: Select "script"
   - **Description**: Brief description
   - **About URL**: Your project URL
   - **Redirect URI**: http://localhost:8080 (required but not used)
4. Click "Create app"
5. Note your **client_id** (under the app name) and **client_secret**

#### Configure Credentials
1. Copy the example file:
   ```bash
   cp config/reddit-credentials.json.example config/reddit-credentials.json
   ```

2. Edit `config/reddit-credentials.json` with your credentials:
   ```json
   {
     "client_id": "YOUR_CLIENT_ID_HERE",
     "client_secret": "YOUR_CLIENT_SECRET_HERE",
     "username": "your_reddit_username",
     "password": "your_reddit_password",
     "user_agent": "marketing-bot/1.0 by your_reddit_username"
   }
   ```

#### CRITICAL: Protect Your Credentials

**The workflow will verify this automatically, but you should also check manually:**

3. **Verify .gitignore protection**:
   ```bash
   # Check if credentials are already protected
   grep -q "reddit-credentials.json" .gitignore && echo "Protected!" || echo "NOT protected!"
   ```

4. **If not protected, add to `.gitignore`**:
   ```bash
   echo "" >> .gitignore
   echo "# API credentials - NEVER commit" >> .gitignore
   echo "config/reddit-credentials.json" >> .gitignore
   echo "config/*-credentials.json" >> .gitignore
   ```

5. **If you accidentally staged credentials**:
   ```bash
   git reset HEAD config/reddit-credentials.json
   git rm --cached config/reddit-credentials.json
   ```

**The workflow includes Phase 0: Security Verification that will:**
- Check if credentials file exists
- Verify .gitignore includes the credentials file
- Check git status for accidental staging
- ABORT if credentials might be committed

### 2. The Workflow Will Guide You (Socratic Discovery)

**You don't need to prepare everything in advance!** The workflow uses **Socratic questioning** to extract your true marketing intent through strategic questions.

The workflow will ask you about:

**Round 1: Core Intent**
- What are you promoting? (open source, SaaS, content, service)
- What does it do?
- What URL to link to?

**Round 2: Problem-Solution Fit**
- What specific problem does it solve?
- Who has this problem?
- What skill level are they?

**Round 3: Competitive Landscape**
- What alternatives exist?
- How is your project different/better?

**Round 4: Tone & Style**
- How do you want to come across?
- Writing style preferences (casual, professional, technical, friendly)

**Round 5: Scope & Targets**
- Which subreddits to target?
- How many posts to analyze?

After gathering this information, the workflow synthesizes your **campaign intent** and uses it to generate highly targeted, authentic comments.

**Comment Style & Tone:**
This is where you describe EXACTLY how you want comments to sound!

**Tone Options:**
- Professional & Technical
- Conversational & Friendly
- Fast-Typing Human (casual, lowercase, typos ok)
- Enthusiastic & Energetic
- Minimalist & Direct
- Educational & Patient

**Length Preference:**
- Short (50-100 words)
- Medium (100-150 words)
- Long (150-250 words)
- Variable (adjust based on complexity)

**Writing Style Details:**
- Capitalization: Standard / mostly lowercase / Mixed
- Punctuation: Proper / casual / minimal
- Abbreviations: None / common (bc, smth) / frequent
- Typos: None / occasional / frequent (authentic feel)
- Emoji usage: None / minimal / moderate / frequent
- Code examples: Always / when relevant / rarely
- Technical jargon: Heavy / moderate / minimal / ELI5

**Example Style Descriptions:**
- "Fast-typing human: mostly lowercase, common abbreviations like bc/smth/w/, occasional typos, very casual but helpful, 100-150 words"
- "Professional technical: proper capitalization and punctuation, formal language, expert terminology, no abbreviations or typos, 150-200 words"
- "Friendly coworker: conversational but professional, proper grammar, occasional casual phrase, helpful tone, 120-150 words, occasional emoji"

**Content Preferences:**
- Mention competitors? (yes/no)
- Include code examples? (yes/no)
- Max comment length (default: 150 words)
- Number of posts to target (default: 50)

### 3. Run the Workflow

```bash
# Using the orchestration slash command
/orchestration:template universal-marketing-campaign

# Or direct execution
/orchestration:run examples/universal-marketing-campaign.flow
```

### 4. Workflow Phases

The workflow executes these phases:

1. **Phase 0: Security Verification** - Verify credentials exist, are valid, and protected by .gitignore
2. **Phase 1: Socratic Discovery** - Extract your TRUE marketing intent through strategic questions
3. **Phase 2: Configuration** - Finalize campaign parameters, auto-derive keywords
4. **Phase 3: Fetch Posts** - Search Reddit for relevant posts matching your keywords
5. **Phase 4: Filter & Analyze** - Score posts by opportunity/relevance against your intent
6. **Phase 5: Generate Comments** - Create helpful comments matching your exact tone/style
7. **Phase 6: Review Checkpoint** - You review and approve before posting
8. **Phase 7: Post Comments** - Post with rate limiting (2 min between comments)
9. **Phase 8: Generate Report** - Comprehensive campaign analytics with recommendations

## Campaign Strategy: Soft Promotion

The workflow uses "soft promotion" approach:

**70% Helpful** + **30% Promotional** = Natural, Valuable Comments

### Good Example:
```
I ran into similar issues with multi-step workflows. The coordination
gets messy fast, especially with parallel execution.

The usual approach is building custom orchestration, but that's a lot
of boilerplate. You end up with complex state management.

We built [Project] specifically for this - it handles parallel agents,
checkpoints, and conditional routing with simple syntax:

step1 -> (parallel1 || parallel2) -> @review

[Project URL] if you want to check it out. Happy to answer questions!
```

### What Makes It Work:
✅ Acknowledges their problem first
✅ Provides helpful context
✅ Natural product introduction
✅ Concrete example/benefit
✅ Friendly, not pushy

### Avoid:
❌ Leading with product mention
❌ Salesy language ("revolutionary", "game-changer")
❌ Ignoring their actual question
❌ No concrete value add

## Style Examples: Same Comment, Different Tones

Here's how the SAME helpful response looks in different styles:

### Style: "Fast-Typing Human"
```
yeah i had the same problem w/ workflow orchestration lol

tried building custom state management but it got messy af. too much
boilerplate and hard to debug when smth breaks

we built [Project] bc of this - it handles parallel agents, checkpoints,
conditional stuff w/ simple syntax like:

step1 -> (parallel1 || parallel2) -> @review

check it out at [URL] if ur interested. happy to help if u got questions
```

### Style: "Professional & Technical"
```
Multi-step workflow orchestration presents significant architectural
challenges, particularly regarding state management and parallel execution
coordination.

The conventional approach requires implementing custom orchestration logic,
which introduces substantial boilerplate code and increases debugging
complexity. State synchronization across parallel operations becomes
increasingly difficult to maintain.

We developed [Project] specifically to address these architectural concerns.
The system provides first-class support for parallel agent execution,
checkpoint mechanisms, and conditional routing through a declarative syntax:

step1 -> (parallel1 || parallel2) -> merge -> @review

Documentation and implementation examples are available at [URL]. I'm happy
to provide additional technical details if needed.
```

### Style: "Friendly Coworker"
```
Oh yeah, I've definitely run into this! Workflow orchestration can get
surprisingly complex once you add parallel execution.

I tried building custom state management for this, but it turned into a
maintenance nightmare. Lots of boilerplate, and debugging was painful.

We ended up building [Project] to solve exactly this problem. It handles
parallel agents, checkpoints, and conditional flows with pretty clean syntax:

step1 -> (parallel1 || parallel2) -> @review

Check it out at [URL] if it sounds useful! Happy to answer any questions 😊
```

### Style: "Minimalist & Direct"
```
Had same issue. Custom orchestration = too much boilerplate.

Built [Project] for this. Handles parallel agents + checkpoints:

step1 -> (parallel1 || parallel2) -> @review

[URL]
```

**Key Takeaway:** Your style choice dramatically affects how your comments are received!
- Fast-typing = relatable, authentic, but may seem unprofessional in some communities
- Professional = credible, thorough, but can feel corporate/salesy
- Friendly = balanced, approachable, works well in most communities
- Minimalist = quick read, but might lack context/helpfulness

Choose based on your target subreddit culture and audience expectations.

## Rate Limiting & Safety

The workflow includes built-in safety features:

- **Batch Processing**: 5 comments per batch
- **Rate Limiting**: 2 minutes between comments
- **Review Checkpoint**: Manual approval before posting
- **Error Handling**: Retries for network issues, aborts on auth errors
- **Community Checking**: Filters subreddits with strict no-promotion rules

## Monitoring & Follow-up

After the campaign runs, the workflow generates a report with:

- Success/failure stats
- Comment URLs for monitoring
- Keyword performance analysis
- Subreddit receptiveness breakdown
- Recommendations for next campaign

### Immediate Actions (Next 24h):
- Monitor comments for replies/questions
- Respond to follow-ups
- Track comment scores

### Next 7 Days:
- Check project traffic from Reddit
- Monitor GitHub stars/installs
- Collect feedback from interactions

### Next Campaign:
- Run again in 7-14 days
- Adjust based on performance data

## Troubleshooting

### "Authentication failed"
- Verify credentials in `config/reddit-credentials.json`
- Check username/password are correct
- Ensure client_id and client_secret match your app

### "Rate limit exceeded"
- Workflow will wait 10 minutes and retry
- Reduce batch size or increase delay if it persists

### "Post deleted/locked"
- Workflow automatically skips these
- They'll appear in the report as "skipped"

### Comments getting downvoted
- Review your marketing angle - might be too promotional
- Check if subreddit is receptive to product mentions
- Ensure comments are genuinely helpful first

## Best Practices

1. **Start Small**: First campaign, target 20-30 posts to test reception
2. **Be Genuine**: If your project doesn't solve their problem, skip the post
3. **Engage**: Respond to replies and questions on your comments
4. **Iterate**: Use report data to improve next campaign
5. **Respect Communities**: Follow subreddit rules, don't spam
6. **Track Impact**: Monitor project analytics to measure campaign effectiveness

## Advanced Customization

You can modify the workflow for:

- Different platforms (Twitter, HN, LinkedIn)
- Different comment styles (more casual, more technical)
- Custom scoring algorithms
- Integration with analytics tools
- A/B testing different angles

See `universal-marketing-campaign.flow` and adjust the agent prompts as needed.

## Support

For issues or questions:
- Check the orchestration plugin docs
- Review the workflow comments for detailed instructions
- Test with small campaigns first
- Monitor results and iterate

Happy marketing! 🚀
