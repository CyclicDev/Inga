import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as fs from "fs";
import OpenAI from "openai";
import 'dotenv/config';

// Safely handle the potential null value
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY in your environment variables.");
}

// Initialize OpenAI client with API key from .env file
const openai = new OpenAI({ apiKey });

// Path to your local image file
const imagePath = "./lib/form.jpeg";
const base64Image = fs.readFileSync(imagePath, "base64");

const parseForm = async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Parse this image of a form into structured JSON. Respond only with JSON.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please convert this form to JSON format." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.0,
    });

    // const jsonResponse = JSON.parse(completion.choices[0].message.content as string);
    // console.log(jsonResponse);
    const rawResponse = completion.choices[0].message.content;
    console.log("Raw response:", rawResponse);

    const cleanedResponse = rawResponse ? rawResponse.replace(/```json|```/g, '').trim() : '';

    try {
      const jsonResponse = JSON.parse(cleanedResponse);
      console.log("Parsed JSON response:", jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }


  } catch (error: any) {
    console.error("Error:", error.message);
  }
};

async function fillPdfForm(templatePdfPath: string, outputPdfPath: string, formData: Record<string, string>) {
  const templatePdfBytes = fs.readFileSync(templatePdfPath);
  const pdfDoc = await PDFDocument.load(templatePdfBytes);
  const form = pdfDoc.getForm();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(font);

  for (const [fieldName, fieldValue] of Object.entries(formData)) {
    const field = form.getFieldMaybe(fieldName); // or getField if you want it to throw
    if (!field) {
      console.warn(`Field "${fieldName}" not found in the form.`);
      continue;
    }

    let value = fieldValue;

    if (value.startsWith('AI:')) {
      const prompt = value.substring(3);
      try {
        const response = await openai.completions.create({
          model: 'text-davinci-003',
          prompt,
          max_tokens: 100,
        });
        value = response.choices[0].text.trim();
      } catch (error) {
        console.error(`OpenAI error for field "${fieldName}":`, error);
        continue;
      }
    }

    if (field.setText) {
      field.setText(value);
    } else {
      console.warn(`Field "${fieldName}" is not a text field.`);
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
}

fillPdfForm('./lib/blank.pdf', './lib/filled.pdf', {
  name: 'Mikey',
  summary: 'AI:Give me a motivational quote.'
});

// // TODO:

// /**
//  * "Interaction loop": repeatedly prompting the model and passing in the user's 
//  * response until the form is complete.
//  */
  

const RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "form_schema",
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the form"
        },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the field"
              },
              type: {
                type: "string",
                description: "The type of the field (e.g., text, number, address, phone number, email, date, etc.)"
              },
              value: {
                type: ["string", "number", "null"],
                description: "The user's response for this field"
              },
              //  subfields: {
              // type: "array",
              // items: {
              // $ref: "#/properties/fields/items"
              // }
            }
          },
          required: ["name", "type"],
          additionalProperties: false
        }
      }
    },
    required: ["name", "fields"],
    additionalProperties: false
  },
  strict: true
}






