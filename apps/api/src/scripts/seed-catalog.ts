/**
 * Catalog seed.
 * Idempotent: re-runnable; upserts by code/popId.
 *
 * Usage: pnpm --filter @nesso/api seed:catalog
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CatalogService } from '../catalog/catalog.service';

interface SeedInput {
  code: string;
  name: string;
  kind: 'Chemical' | 'Organic' | 'Inventory' | 'Other';
  unit: string;
  defaultCost: number;
  searchTokens: string[];
}

const INPUTS: SeedInput[] = [
  // Organic
  { code: 'ORG-COW-DUNG', name: 'Cow dung manure', kind: 'Organic', unit: 'kg', defaultCost: 4, searchTokens: ['gobar', 'cow', 'dung', 'manure'] },
  { code: 'ORG-VERMICOMPOST', name: 'Vermicompost', kind: 'Organic', unit: 'kg', defaultCost: 10, searchTokens: ['vermi', 'compost', 'worm'] },
  { code: 'ORG-NEEM-CAKE', name: 'Neem cake', kind: 'Organic', unit: 'kg', defaultCost: 35, searchTokens: ['neem', 'cake', 'bevu'] },
  { code: 'ORG-JEEVAMRUTHA', name: 'Jeevamrutha', kind: 'Organic', unit: 'L', defaultCost: 5, searchTokens: ['jeevamrutha', 'natural'] },
  { code: 'ORG-PANCHAGAVYA', name: 'Panchagavya', kind: 'Organic', unit: 'L', defaultCost: 20, searchTokens: ['panchagavya'] },
  { code: 'ORG-AZOSPIRILLUM', name: 'Azospirillum biofertilizer', kind: 'Organic', unit: 'kg', defaultCost: 80, searchTokens: ['azospirillum', 'bio', 'nitrogen'] },
  { code: 'ORG-COMPOST', name: 'Farmyard compost', kind: 'Organic', unit: 'kg', defaultCost: 3, searchTokens: ['compost', 'fym'] },

  // Chemical
  { code: 'CHEM-UREA', name: 'Urea (46-0-0)', kind: 'Chemical', unit: 'kg', defaultCost: 6, searchTokens: ['urea', 'nitrogen', 'n'] },
  { code: 'CHEM-DAP', name: 'DAP (18-46-0)', kind: 'Chemical', unit: 'kg', defaultCost: 28, searchTokens: ['dap', 'phosphate', 'p'] },
  { code: 'CHEM-MOP', name: 'MOP (Muriate of potash)', kind: 'Chemical', unit: 'kg', defaultCost: 17, searchTokens: ['mop', 'potash', 'k'] },
  { code: 'CHEM-NPK-19', name: 'NPK 19-19-19', kind: 'Chemical', unit: 'kg', defaultCost: 32, searchTokens: ['npk', 'complex', 'fertilizer'] },
  { code: 'CHEM-CHLORPYRIFOS', name: 'Chlorpyrifos 20% EC', kind: 'Chemical', unit: 'L', defaultCost: 450, searchTokens: ['chlorpyrifos', 'insecticide'] },
  { code: 'CHEM-MANCOZEB', name: 'Mancozeb 75% WP', kind: 'Chemical', unit: 'kg', defaultCost: 380, searchTokens: ['mancozeb', 'fungicide'] },
  { code: 'CHEM-GLYPHOSATE', name: 'Glyphosate 41% SL', kind: 'Chemical', unit: 'L', defaultCost: 360, searchTokens: ['glyphosate', 'herbicide', 'weedicide'] },

  // Inventory
  { code: 'INV-SEEDS-TUBEROSE', name: 'Tuberose bulbs', kind: 'Inventory', unit: 'nos', defaultCost: 6, searchTokens: ['tuberose', 'bulb', 'sugandharaja'] },
  { code: 'INV-SEEDS-JASMINE', name: 'Jasmine cuttings', kind: 'Inventory', unit: 'nos', defaultCost: 8, searchTokens: ['jasmine', 'mallige', 'cutting'] },
  { code: 'INV-SEEDS-MARIGOLD', name: 'Marigold seeds', kind: 'Inventory', unit: 'g', defaultCost: 12, searchTokens: ['marigold', 'chendu', 'seed'] },
  { code: 'INV-CRATES', name: 'Harvest crates', kind: 'Inventory', unit: 'nos', defaultCost: 120, searchTokens: ['crate', 'box', 'harvest'] },
  { code: 'INV-MULCH', name: 'Plastic mulch film', kind: 'Inventory', unit: 'm', defaultCost: 9, searchTokens: ['mulch', 'film', 'plastic'] },

  // Other
  { code: 'OTH-LABOR-DAILY', name: 'Daily labor wage', kind: 'Other', unit: 'day', defaultCost: 350, searchTokens: ['labor', 'labour', 'wage', 'kooli'] },
  { code: 'OTH-FUEL-DIESEL', name: 'Diesel (pump set)', kind: 'Other', unit: 'L', defaultCost: 92, searchTokens: ['diesel', 'fuel', 'pump'] },
  { code: 'OTH-IRRIGATION-HOUR', name: 'Borewell water pump (per hour)', kind: 'Other', unit: 'hour', defaultCost: 40, searchTokens: ['irrigation', 'pump', 'water'] },
];

const POP_TUBEROSE_HYBRID = {
  popId: 'POP-TUBEROSE-HYBRID-2026',
  crop: 'Tuberose',
  variety: 'Hybrid',
  year: 2026,
  title: 'Tuberose Hybrid · Package of Practices 2026',
  activities: [
    { stage: 'LandPrep', daysFromSowing: -14, activity: 'Land preparation', recommendedInputs: ['ORG-COW-DUNG', 'ORG-COMPOST'], notes: 'Deep ploughing + 5 tonnes/acre compost' },
    { stage: 'Planting', daysFromSowing: 0, activity: 'Bulb planting', recommendedInputs: ['INV-SEEDS-TUBEROSE'], notes: '30,000 bulbs/acre at 30×20 cm spacing' },
    { stage: 'Vegetative', daysFromSowing: 30, activity: 'Basal fertilization', recommendedInputs: ['CHEM-DAP', 'CHEM-MOP'], notes: '100kg DAP + 80kg MOP per acre' },
    { stage: 'Vegetative', daysFromSowing: 60, activity: 'Top-dress nitrogen', recommendedInputs: ['CHEM-UREA'], notes: '40kg urea per acre' },
    { stage: 'Flowering', daysFromSowing: 90, activity: 'Foliar spray (micronutrient)', recommendedInputs: ['CHEM-NPK-19'], notes: '5g/L water' },
    { stage: 'Flowering', daysFromSowing: 110, activity: 'Pest control (thrips)', recommendedInputs: ['CHEM-CHLORPYRIFOS'], notes: 'Spray 2 ml/L' },
    { stage: 'Harvest', daysFromSowing: 120, activity: 'First harvest', recommendedInputs: ['OTH-LABOR-DAILY', 'INV-CRATES'], notes: 'Early-morning pick' },
  ],
};

const POP_JASMINE_SAMBAC = {
  popId: 'POP-JASMINE-SAMBAC-2026',
  crop: 'Jasmine',
  variety: 'Sambac',
  year: 2026,
  title: 'Jasmine Sambac (Mallige) · Package of Practices 2026',
  activities: [
    { stage: 'LandPrep', daysFromSowing: -21, activity: 'Pit digging', recommendedInputs: ['OTH-LABOR-DAILY'], notes: '60×60×60 cm pits at 1.8m spacing' },
    { stage: 'LandPrep', daysFromSowing: -7, activity: 'Fill pits w/ FYM', recommendedInputs: ['ORG-COW-DUNG', 'ORG-NEEM-CAKE'], notes: '10kg FYM + 250g neem cake / pit' },
    { stage: 'Planting', daysFromSowing: 0, activity: 'Cutting planting', recommendedInputs: ['INV-SEEDS-JASMINE'], notes: '1 cutting per pit' },
    { stage: 'Vegetative', daysFromSowing: 45, activity: 'First weeding + earth-up', recommendedInputs: ['OTH-LABOR-DAILY'], notes: '' },
    { stage: 'Vegetative', daysFromSowing: 90, activity: 'NPK fertilization', recommendedInputs: ['CHEM-NPK-19', 'ORG-VERMICOMPOST'], notes: '120g NPK + 1kg vermi per plant' },
    { stage: 'Flowering', daysFromSowing: 150, activity: 'Biofertilizer drench', recommendedInputs: ['ORG-AZOSPIRILLUM'], notes: '5g/L water around root zone' },
    { stage: 'Harvest', daysFromSowing: 180, activity: 'Daily morning harvest', recommendedInputs: ['OTH-LABOR-DAILY', 'INV-CRATES'], notes: 'Pre-dawn pick for peak fragrance' },
  ],
};

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { abortOnError: false });
  const catalog = app.get(CatalogService);

  let inputsCount = 0;
  for (const inp of INPUTS) {
    await catalog.upsertInput(inp);
    inputsCount++;
  }
  // eslint-disable-next-line no-console
  console.log(`✓ Upserted ${inputsCount} input catalog entries`);

  await catalog.upsertPop(POP_TUBEROSE_HYBRID);
  await catalog.upsertPop(POP_JASMINE_SAMBAC);
  // eslint-disable-next-line no-console
  console.log(`✓ Upserted 2 POP catalog entries (Tuberose Hybrid, Jasmine Sambac)`);

  await app.close();
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
