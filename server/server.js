import app from './src/app.js'
import igUserRoutes from './src/routes/insta/user.js'
import sessions from './src/routes/insta/sessions.js'
import mediaRouter from './src/routes/insta/media.js'
import settingsRoutes from "./src/routes/setting.routes.js";
import adsRouter from './src/routes/ads.routes.js';


app.get("/", (req, res) => {
    res.send("heelo")
})


app.use("/ig", igUserRoutes)
app.use("/ig/sessions", sessions)
app.use("/ig/media", mediaRouter)
app.use("/settings", settingsRoutes);
app.use("/ads", adsRouter);

app.listen(3005, (error) => {
    console.log("App Started")
})
