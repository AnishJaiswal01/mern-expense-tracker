import Transaction from '../models/Transaction.js';

export const analyzeChat = async (req, res) => {
  try {
    const { message, currentMonthStr } = req.body;
    const msgLower = message.toLowerCase();
    
    // Fetch user's transactions
    const transactions = await Transaction.find({ user: req.user.id });
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) {
      return res.json({ reply: "You don't have any expenses recorded yet! Once you add some, I can help you analyze them." });
    }

    // Helper functions
    const getMonthData = (yyyyMm) => expenses.filter(e => e.date.toISOString().startsWith(yyyyMm));
    const sumAmounts = (arr) => arr.reduce((sum, t) => sum + t.amount, 0);
    const getCategoryBreakdown = (arr) => arr.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    // Parse current month requested (defaults to current system month if not provided)
    const activeMonth = currentMonthStr || new Date().toISOString().substring(0, 7);
    const activeExpenses = getMonthData(activeMonth);
    
    // Previous month calculation
    const [year, month] = activeMonth.split('-');
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);
    const prevExpenses = getMonthData(prevMonthStr);

    let reply = "I'm a simple financial assistant. I didn't quite catch that. Try asking 'Where am I spending the most?' or 'Compare this month with last month.'";

    // Regex / Keyword matching
    if (msgLower.includes("where am i spending the most") || msgLower.includes("biggest spending habits")) {
      const breakdown = getCategoryBreakdown(activeExpenses);
      if (Object.keys(breakdown).length === 0) {
        reply = `You have no expenses for ${activeMonth}.`;
      } else {
        const topCategory = Object.keys(breakdown).reduce((a, b) => breakdown[a] > breakdown[b] ? a : b);
        reply = `In ${activeMonth}, you are spending the most on **${topCategory}** (₹${breakdown[topCategory].toFixed(2)}).`;
      }
    } 
    else if (msgLower.includes("biggest expense")) {
      if (activeExpenses.length === 0) {
        reply = `You have no expenses for ${activeMonth}.`;
      } else {
        const biggest = activeExpenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
        reply = `Your biggest single expense in ${activeMonth} was **${biggest.description || biggest.category}** for ₹${biggest.amount.toFixed(2)} on ${new Date(biggest.date).toLocaleDateString()}.`;
      }
    }
    else if (msgLower.includes("how much did i spend this month") || msgLower.includes("how much did i spend in")) {
      const total = sumAmounts(activeExpenses);
      reply = `You have spent a total of **₹${total.toFixed(2)}** in ${activeMonth}.`;
    }
    else if (msgLower.includes("how much did i spend last month")) {
      const total = sumAmounts(prevExpenses);
      reply = `Last month (${prevMonthStr}), you spent a total of **₹${total.toFixed(2)}**.`;
    }
    else if (msgLower.includes("compare this month with last month") || msgLower.includes("spending more than before") || msgLower.includes("spending trajectory")) {
      const activeTotal = sumAmounts(activeExpenses);
      const prevTotal = sumAmounts(prevExpenses);
      const diff = activeTotal - prevTotal;
      if (diff > 0) {
        reply = `You have spent **₹${diff.toFixed(2)} more** in ${activeMonth} (₹${activeTotal.toFixed(2)}) compared to last month (₹${prevTotal.toFixed(2)}). You might want to watch your spending!`;
      } else {
        reply = `Great job! You have spent **₹${Math.abs(diff).toFixed(2)} less** in ${activeMonth} (₹${activeTotal.toFixed(2)}) compared to last month (₹${prevTotal.toFixed(2)}).`;
      }
    }
    else if (msgLower.includes("average per month")) {
      const uniqueMonths = [...new Set(expenses.map(e => e.date.toISOString().substring(0, 7)))];
      const totalOverall = sumAmounts(expenses);
      const avg = totalOverall / (uniqueMonths.length || 1);
      reply = `Based on your history of ${uniqueMonths.length} month(s), you spend an average of **₹${avg.toFixed(2)}** per month.`;
    }
    else if (msgLower.includes("reduce my expenses") || msgLower.includes("save money") || msgLower.includes("focus on reducing")) {
      const breakdown = getCategoryBreakdown(activeExpenses);
      const sortedCategories = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
      
      if (sortedCategories.length >= 2) {
        reply = `To save money, you should focus on your top 2 categories: **${sortedCategories[0]}** (₹${breakdown[sortedCategories[0]].toFixed(2)}) and **${sortedCategories[1]}** (₹${breakdown[sortedCategories[1]].toFixed(2)}). Consider setting a stricter budget for these.`;
      } else if (sortedCategories.length === 1) {
        reply = `You only have expenses in **${sortedCategories[0]}**. Try reducing that to save money.`;
      } else {
        reply = `Add some expenses first so I can analyze where you can save!`;
      }
    }
    else if (msgLower.includes("how much did i spend on food") || msgLower.match(/spend on (\w+)/)) {
      const match = msgLower.match(/spend on (\w+)/);
      const categoryMatch = match ? match[1] : "food";
      
      const catExpenses = activeExpenses.filter(e => e.category === categoryMatch);
      const totalCat = sumAmounts(catExpenses);
      reply = `In ${activeMonth}, you spent **₹${totalCat.toFixed(2)}** on ${categoryMatch}.`;
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "Sorry, I encountered an error analyzing your data." });
  }
};
