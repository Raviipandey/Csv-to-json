import { Request, Response } from "express";
import { pool } from "../config/database";
import { CsvParser } from "../utils/csvParser";
import fs from "fs";

export class UserController {
  public static async uploadCSV(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const parser = new CsvParser(1000);
      const totalRecords = await parser.processCSVStream(req.file.path);
      await parser.calculateAgeDistribution();

      fs.unlinkSync(req.file.path);
      res.status(200).json({
        message: "CSV processed successfully",
        recordsProcessed: totalRecords,
      });
    } catch (error) {
      console.error("Error processing CSV:", error);
      res.status(500).json({ error: "Failed to process CSV file" });
    }
  }
}