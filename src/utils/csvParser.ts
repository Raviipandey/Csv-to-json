// CsvParser.ts
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { pool } from "../config/database";
import { ParsedData, RawParsedData, DbRecord } from "../interfaces/types";

export class CsvParser {
  private headers: string[] = [];
  private batchSize: number = 1000;

  constructor(batchSize: number = 1000) {
    this.batchSize = batchSize;
  }

  private parseHeader(headerLine: string): string[] {
    return headerLine.split(",").map((header) => header.trim());
  }

  private parseLine(line: string): string[] {
    return line.split(",").map((value) => value.trim());
  }

  private createNestedObject(values: string[]): RawParsedData {
    const result: Record<string, unknown> = {};

    this.headers.forEach((header, index) => {
      const value = values[index];
      if (header.includes(".")) {
        const parts = header.split(".");
        let current = result;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]] as Record<string, unknown>;
        }
        current[parts[parts.length - 1]] = value;
      } else {
        result[header] = value;
      }
    });

    return result as RawParsedData;
  }

  private processLine(values: string[]): ParsedData {
    const parsed = this.createNestedObject(values);

    return {
      name: `${parsed.name.firstName} ${parsed.name.lastName}`,
      age: parseInt(parsed.age),
      address: {
        line1: parsed.address?.line1,
        line2: parsed.address?.line2,
        city: parsed.address?.city,
        state: parsed.address?.state,
      },
      additional_info: Object.keys(parsed)
        .filter((key) => !["name", "age", "address"].includes(key))
        .reduce((obj, key) => ({ ...obj, [key]: parsed[key] }), {}),
    };
  }

  public async processCSVStream(filePath: string): Promise<number> {
    const fileStream = createReadStream(filePath, {
      encoding: "utf-8",
      highWaterMark: 64 * 1024,
    });
    const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

    let isFirstLine = true;
    let batch: ParsedData[] = [];
    let totalRecords = 0;

    for await (const line of rl) {
      if (isFirstLine) {
        this.headers = this.parseHeader(line);
        isFirstLine = false;
        continue;
      }

      if (!line.trim()) continue;

      const values = this.parseLine(line);
      const parsedData = this.processLine(values);
      batch.push(parsedData);

      if (batch.length >= this.batchSize) {
        await this.processBatch(batch);
        totalRecords += batch.length;
        console.log("Total records processed:", totalRecords);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await this.processBatch(batch);
      totalRecords += batch.length;
      console.log("Total records processed:", totalRecords);
    }

    return totalRecords;
  }

  private async processBatch(batch: ParsedData[]): Promise<void> {
    const values: DbRecord[] = batch.map((record: ParsedData) => ({
      name: record.name,
      age: record.age,
      address: JSON.stringify(record.address),
      additional_info: JSON.stringify(record.additional_info),
    }));

    const placeholders = values
      .map(
        (_, index) =>
          `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${
            index * 4 + 4
          })`
      )
      .join(",");

    const flatValues = values.flatMap((v) => [
      v.name,
      v.age,
      v.address,
      v.additional_info,
    ]);

    await pool.query(
      `INSERT INTO users (name, age, address, additional_info) VALUES ${placeholders}`,
      flatValues
    );
  }


  public async calculateAgeDistribution(): Promise<void> {
    const query = `
      SELECT
        SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) AS under_20,
        SUM(CASE WHEN age BETWEEN 20 AND 40 THEN 1 ELSE 0 END) AS between_20_40,
        SUM(CASE WHEN age BETWEEN 40 AND 60 THEN 1 ELSE 0 END) AS between_40_60,
        SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) AS over_60,
        COUNT(*) AS total
      FROM users;
    `;
  
    const result = await pool.query(query);
    const { under_20, between_20_40, between_40_60, over_60, total } =
      result.rows[0];
  
    if (total === 0) {
      console.log("No records found.");
      return;
    }
  
    const distribution = {
      "< 20": Math.round((under_20 / total) * 100),
      "20 to 40": Math.round((between_20_40 / total) * 100),
      "40 to 60": Math.round((between_40_60 / total) * 100),
      "> 60": Math.round((over_60 / total) * 100),
    };
  
    console.log("Age Distribution Report:");
    console.log("Age Group   | % Distribution");
    console.log("---------------------------");
    for (const [ageGroup, percentage] of Object.entries(distribution)) {
      console.log(`${ageGroup.padEnd(11)} | ${percentage.toString().padStart(10)}`);
    }
  }
  
}
