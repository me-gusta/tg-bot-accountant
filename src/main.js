const dotenv = require('dotenv');
dotenv.config()
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters');
const Datastore = require('nedb')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
const MODERATOR_ID = Number(process.env.MODERATOR_ID)

const dbPath = process.env.MODE === 'dev'
  ? require('path').join(process.cwd(), 'budget.db')
  : '/function/storage/data/budget.db'

const db = new Datastore({ filename: dbPath, autoload: true })

const state = {
    categories: {},
    checkpoints: {}
}

// Load state from db
const loadState = () => {
  return new Promise((resolve) => {
    db.findOne({ _id: 'budget_state' }, (err, doc) => {
      if (doc) {
        state.categories = doc.categories || {}
        state.checkpoints = doc.checkpoints || {}
      }
      resolve()
    })
  })
}

const saveState = () => {
  db.update(
    { _id: 'budget_state' },
    { _id: 'budget_state', categories: state.categories, checkpoints: state.checkpoints },
    { upsert: true },
    () => {}
  )
}

const parse = text => text.toLowerCase().trim()

const handleSet = (text, ctx) => {
    const match = text.match(/^([\wа-яёА-ЯЁ]+)\s*=\s*(-?\d+)$/i)
    if (!match) return
    const [, category, value] = match
    state.categories[category] = parseInt(value)
    saveState()
    ctx.reply(`Set ${category} to ${value}`)
}

const handleAdd = (text, ctx) => {
    const match = text.match(/^([\wа-яёА-ЯЁ]+)\s*\+\s*(-?\d+)$/i)
    if (!match) return
    const [, category, value] = match
    state.categories[category] = (state.categories[category] || 0) + parseInt(value)
    saveState()
    ctx.reply(`Added ${value} to ${category}`)
}

const handleSubtract = (text, ctx) => {
    const match = text.match(/^([\wа-яёА-ЯЁ]+)\s*-\s*(-?\d+)$/i)
    if (!match) return
    const [, category, value] = match
    state.categories[category] = (state.categories[category] || 0) - parseInt(value)
    saveState()
    ctx.reply(`Subtracted ${value} from ${category}`)
}

const showDashboard = ctx => {
    const lines = Object.keys(state.categories).map(cat => {
        const current = state.categories[cat]
        const checkpoint = state.checkpoints[cat] ?? 'N/A'
        return `- ${cat} | ${checkpoint} | ${current}`
    })
    ctx.reply(lines.length ? lines.join('\n') : 'No categories yet')
}

const isModerator = ctx => ctx.from && ctx.from.id === MODERATOR_ID

bot.command('checkpoint', ctx => {
    if (!isModerator(ctx)) return ctx.reply('⛔ Only the moderator can use this bot.')
    const text = parse(ctx.message.text)
    const parts = text.split(' ')
    if (parts.length === 1) {
        for (const cat in state.categories)
            state.checkpoints[cat] = state.categories[cat]
        saveState()
        ctx.reply('Checkpoint set for all categories')
    } else if (parts.length === 2) {
        const category = parts[1]
        if (state.categories[category] !== undefined) {
            state.checkpoints[category] = state.categories[category]
            saveState()
            ctx.reply(`Checkpoint set for ${category}`)
        } else {
            ctx.reply(`Category "${category}" not found`)
        }
    }
})

bot.command('dashboard', ctx => {
    if (!isModerator(ctx)) return ctx.reply('⛔ Only the moderator can use this bot.')
    showDashboard(ctx)
})

bot.command('start', ctx => {
    if (!isModerator(ctx)) return ctx.reply('⛔ Only the moderator can use this bot.')
    showDashboard(ctx)
})

bot.command('help', ctx => {
    if (!isModerator(ctx)) return ctx.reply('⛔ Only the moderator can use this bot.')
    ctx.reply(
        `📘 *Budget Tracker 101 Help*\n\n` +
        `Text commands:\n` +
        `- set <category> =N → set amount for category\n` +
        `- add <category> =N → add amount to category\n` +
        `- substract <category> =N → subtract amount from category\n\n` +
        `Bot commands:\n` +
        `/checkpoint → set checkpoint for all categories\n` +
        `/checkpoint <category> → set checkpoint for one category\n` +
        `/dashboard → view current and checkpoint values\n` +
        `/start → same as /dashboard\n` +
        `/help → show this help message`
    )
})

bot.on(message('text'), ctx => {
    if (!isModerator(ctx)) return ctx.reply('⛔ Only the moderator can use this bot.')
    const text = parse(ctx.message.text)
    if (/^[\wа-яёА-ЯЁ]+\s*=\s*-?\d+$/i.test(text)) return handleSet(text, ctx)
    if (/^[\wа-яёА-ЯЁ]+\s*\+\s*-?\d+$/i.test(text)) return handleAdd(text, ctx)
    if (/^[\wа-яёА-ЯЁ]+\s*-\s*-?\d+$/i.test(text)) return handleSubtract(text, ctx)
    
    ctx.reply('Whaaa?')
})

loadState().then(() => {
  bot.launch()
  console.log('bot is running')
})
