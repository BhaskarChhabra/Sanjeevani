import { Router } from "express";
import { searchMedicines } from "../controllers/medicine.controller.js";
// Optional: Add your authentication middleware if this route needs to be protected
// import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// If you want all medicine routes to be protected, you can use middleware like this:
// router.use(isAuthenticated);

// Define the route for searching medicines
// URL will be: GET /api/v1/medicines/search?medicine=paracetamol
router.route("/search").get(searchMedicines);

export default router;