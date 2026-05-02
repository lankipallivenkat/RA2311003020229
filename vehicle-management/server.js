const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());




function optimizeTasks(tasks, maxHours) {
    const dp = new Array(maxHours + 1).fill(0);

    for (let task of tasks) {
        for (let w = maxHours; w >= task.time; w--) {
            dp[w] = Math.max(dp[w], dp[w - task.time] + task.importance);
        }
    }

    return dp[maxHours];
}


app.post('/optimize/:depotId', async (req, res) => {
    try {
        const depotId = parseInt(req.params.depotId);

        
        const depotRes = await axios.get(
            "http://20.207.122.201/evaluation-service/depots",
            {
                headers: {
                    Authorization: "Bearer QkbpxH"
                }
            }
        );

        
        const depots = depotRes.data.data || depotRes.data;

        
        const depot = depots.find(d => d.id === depotId);

        if (!depot) {
            return res.status(404).json({ message: "Depot not found" });
        }

        const mechanicHours = depot.mechanicHours;

        
        const { tasks } = req.body;

        if (!tasks) {
            return res.status(400).json({ message: "Tasks required" });
        }

        
        const maxImportance = optimizeTasks(tasks, mechanicHours);

        
        res.json({
            depotId,
            mechanicHours,
            maxImportance
        });

    } catch (err) {
        console.log("FULL ERROR:", err.message);
        res.status(500).json({ message: "Error fetching depot data" });
    }
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
