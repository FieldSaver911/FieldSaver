import type { Knex } from 'knex';

const NEMSIS_LIBRARY_ID = 'lib_nemsis35';

const SYSTEM_COLUMNS = [
  { id: 'col_label',       label: 'Label',        key: 'label',       type: 'text',    required: true },
  { id: 'col_code',        label: 'Code',         key: 'code',        type: 'text',    required: false },
  { id: 'col_export_key',  label: 'Export Key',   key: 'exportKey',   type: 'text',    required: true },
  { id: 'col_description', label: 'Description',  key: 'description', type: 'text',    required: false },
  { id: 'col_category',    label: 'Category',     key: 'category',    type: 'text',    required: false },
  { id: 'col_sub_cat',     label: 'Sub-Category', key: 'subCategory', type: 'text',    required: false },
  { id: 'col_usage',       label: 'Usage',        key: 'usage',       type: 'text',    required: false },
  { id: 'col_element_id',  label: 'Element ID',   key: 'elementId',   type: 'text',    required: false },
];

// Row shape for seeding (without id — DB generates)
interface SeedRow {
  id: string;
  library_id: string;
  label: string;
  code: string;
  export_key: string;
  description: string;
  category: string;
  sub_category: string;
  usage: string;
  element_id: string;
  sort_order: number;
}

function row(
  id: string, label: string, code: string, exportKey: string,
  description: string, category: string, subCategory: string,
  usage: string, elementId: string, sortOrder: number,
): SeedRow {
  return {
    id,
    library_id: NEMSIS_LIBRARY_ID,
    label, code,
    export_key: exportKey,
    description, category,
    sub_category: subCategory,
    usage, element_id: elementId,
    sort_order: sortOrder,
  };
}

const NOT_VALUES: SeedRow[] = [
  row('nv_na',  'Not Applicable', '7701001', 'notApplicable', 'Value is not applicable to this situation', 'NOT Value', 'System', 'Optional', '', 1),
  row('nv_nr',  'Not Recorded',   '7701003', 'notRecorded',   'Value was not recorded at time of incident', 'NOT Value', 'System', 'Optional', '', 2),
  row('nv_nrp', 'Not Reporting',  '7701005', 'notReporting',  'Agency is not reporting this element', 'NOT Value', 'System', 'Optional', '', 3),
];

const PERTINENT_NEGATIVES: SeedRow[] = [
  row('pn_01', 'Contraindication Noted',           '8801001', 'contraindicationNoted',           'A contraindication was noted', 'Pertinent Negative', 'Clinical', 'Optional', '', 1),
  row('pn_02', 'Denied By Order',                  '8801003', 'deniedByOrder',                   'Procedure denied by medical order', 'Pertinent Negative', 'Clinical', 'Optional', '', 2),
  row('pn_03', 'Exempt from Protocol',             '8801005', 'exemptFromProtocol',              'Patient/situation exempt from protocol', 'Pertinent Negative', 'Clinical', 'Optional', '', 3),
  row('pn_04', 'Inadvertently Omitted',            '8801007', 'inadvertentlyOmitted',            'Data was inadvertently not collected', 'Pertinent Negative', 'Documentation', 'Optional', '', 4),
  row('pn_05', 'Medication Allergy',               '8801009', 'medicationAllergyPresent',        'Patient has allergy to this medication', 'Pertinent Negative', 'Clinical', 'Optional', '', 5),
  row('pn_06', 'Medication Already Taken',         '8801011', 'medicationAlreadyTaken',          'Patient had already taken this medication', 'Pertinent Negative', 'Clinical', 'Optional', '', 6),
  row('pn_07', 'No Problem Found',                 '8801013', 'noProblemFound',                  'Assessment revealed no problem', 'Pertinent Negative', 'Clinical', 'Optional', '', 7),
  row('pn_08', 'None',                             '8801015', 'none',                            'None present', 'Pertinent Negative', 'Clinical', 'Optional', '', 8),
  row('pn_09', 'Not Applicable',                   '8801017', 'notApplicablePn',                 'Not applicable to this patient/situation', 'Pertinent Negative', 'Clinical', 'Optional', '', 9),
  row('pn_10', 'Refused',                          '8801019', 'refused',                         'Patient refused treatment or procedure', 'Pertinent Negative', 'Clinical', 'Optional', '', 10),
  row('pn_11', 'Unresponsive',                     '8801021', 'unresponsive',                    'Patient was unresponsive', 'Pertinent Negative', 'Clinical', 'Optional', '', 11),
  row('pn_12', 'Unable to Complete',               '8801023', 'unableToComplete',                'Unable to complete the procedure', 'Pertinent Negative', 'Clinical', 'Optional', '', 12),
  row('pn_13', 'Order Criteria Not Met',           '8801025', 'orderCriteriaNotMet',             'Criteria for order were not met', 'Pertinent Negative', 'Clinical', 'Optional', '', 13),
  row('pn_14', 'Symptom Not Present',              '8801027', 'symptomNotPresent',               'This symptom was not present', 'Pertinent Negative', 'Clinical', 'Optional', '', 14),
  row('pn_15', 'Condition Contraindicated',        '8801031', 'conditionContraindicated',        'Patient condition contraindicated this', 'Pertinent Negative', 'Clinical', 'Optional', '', 15),
];

const NILLABLE: SeedRow[] = [
  row('nil_01', 'Nillable (xsi:nil)', '', 'xsiNil', 'Submit as xsi:nil="true" when element is nillable and left blank', 'Nillable Marker', 'System', 'Optional', '', 1),
];

const DATA_ELEMENTS: SeedRow[] = [
  // ── eTimes ──────────────────────────────────────────────────────────────────
  row('de_etimes_01', 'PSAP Call Date/Time',          '', 'eTimes.PSAPCallDateTime',          'Date/time 911 call was received', 'Data Element', 'Operational', 'Recommended', 'eTimes.01', 1),
  row('de_etimes_05', 'Unit Notified Date/Time',       '', 'eTimes.UnitNotified',              'Date/time unit was notified', 'Data Element', 'Operational', 'Recommended', 'eTimes.05', 2),
  row('de_etimes_06', 'Dispatch Acknowledged',         '', 'eTimes.DispatchAcknowledged',      'Date/time dispatch was acknowledged', 'Data Element', 'Operational', 'Optional', 'eTimes.06', 3),
  row('de_etimes_07', 'Unit En Route Date/Time',       '', 'eTimes.UnitEnRoute',               'Date/time unit began responding', 'Data Element', 'Operational', 'Recommended', 'eTimes.07', 4),
  row('de_etimes_08', 'Unit Arrived on Scene',         '', 'eTimes.UnitArrivedOnScene',        'Date/time unit arrived at scene', 'Data Element', 'Operational', 'Required', 'eTimes.08', 5),
  row('de_etimes_11', 'Arrived at Patient',            '', 'eTimes.ArrivedAtPatient',          'Date/time provider arrived at patient', 'Data Element', 'Operational', 'Recommended', 'eTimes.11', 6),
  row('de_etimes_13', 'Unit Left Scene',               '', 'eTimes.UnitLeftScene',             'Date/time unit left scene', 'Data Element', 'Operational', 'Required', 'eTimes.13', 7),
  row('de_etimes_15', 'Arrived at Destination',        '', 'eTimes.ArrivedAtDestination',      'Date/time unit arrived at destination', 'Data Element', 'Operational', 'Required', 'eTimes.15', 8),
  row('de_etimes_21', 'Unit Back In Service',          '', 'eTimes.UnitBackInService',         'Date/time unit was back in service', 'Data Element', 'Operational', 'Recommended', 'eTimes.21', 9),
  // ── ePatient ────────────────────────────────────────────────────────────────
  row('de_epatient_02', 'Last Name',              '', 'ePatient.LastName',           'Patient last name', 'Data Element', 'Patient', 'Recommended', 'ePatient.02', 10),
  row('de_epatient_03', 'First Name',             '', 'ePatient.FirstName',          'Patient first name', 'Data Element', 'Patient', 'Recommended', 'ePatient.03', 11),
  row('de_epatient_07', 'Home County',            '', 'ePatient.HomeCounty',         'Patient home county', 'Data Element', 'Patient', 'Optional', 'ePatient.07', 12),
  row('de_epatient_08', 'Home State',             '', 'ePatient.HomeState',          'Patient home state', 'Data Element', 'Patient', 'Optional', 'ePatient.08', 13),
  row('de_epatient_13', 'Gender',                 '', 'ePatient.Gender',             'Patient gender', 'Data Element', 'Patient', 'Required', 'ePatient.13', 14),
  row('de_epatient_14', 'Race',                   '', 'ePatient.Race',               'Patient race', 'Data Element', 'Patient', 'Recommended', 'ePatient.14', 15),
  row('de_epatient_15', 'Age',                    '', 'ePatient.Age',                'Patient age in years', 'Data Element', 'Patient', 'Required', 'ePatient.15', 16),
  row('de_epatient_17', 'Date of Birth',          '', 'ePatient.DateOfBirth',        'Patient date of birth', 'Data Element', 'Patient', 'Recommended', 'ePatient.17', 17),
  // ── eSituation ──────────────────────────────────────────────────────────────
  row('de_esit_07', 'Chief Complaint Location',   '', 'eSituation.ChiefComplaintLocation', 'Anatomic location of chief complaint', 'Data Element', 'Clinical', 'Recommended', 'eSituation.07', 18),
  row('de_esit_09', 'Primary Symptom',            '', 'eSituation.PrimarySymptom',         'Primary symptom', 'Data Element', 'Clinical', 'Required', 'eSituation.09', 19),
  row('de_esit_11', 'Primary Impression',         '', 'eSituation.PrimaryImpression',      "Provider's primary impression", 'Data Element', 'Clinical', 'Required', 'eSituation.11', 20),
  row('de_esit_13', 'Initial Patient Acuity',     '', 'eSituation.InitialAcuity',          'Patient acuity on initial assessment', 'Data Element', 'Clinical', 'Required', 'eSituation.13', 21),
  // ── eVitals ─────────────────────────────────────────────────────────────────
  row('de_evitals_01', 'Vitals Date/Time',         '', 'eVitals.DateTime',           'Date/time vital signs taken', 'Data Element', 'Clinical', 'Required', 'eVitals.01', 22),
  row('de_evitals_06', 'Systolic BP',              '', 'eVitals.SBP',                'Systolic blood pressure (mmHg)', 'Data Element', 'Clinical', 'Required', 'eVitals.06', 23),
  row('de_evitals_07', 'Diastolic BP',             '', 'eVitals.DBP',                'Diastolic blood pressure (mmHg)', 'Data Element', 'Clinical', 'Recommended', 'eVitals.07', 24),
  row('de_evitals_09', 'Heart Rate',               '', 'eVitals.HeartRate',          'Heart rate (beats/min)', 'Data Element', 'Clinical', 'Required', 'eVitals.09', 25),
  row('de_evitals_12', 'Pulse Oximetry (SpO2)',    '', 'eVitals.SpO2',               'Pulse oximetry (%)', 'Data Element', 'Clinical', 'Recommended', 'eVitals.12', 26),
  row('de_evitals_14', 'Respiratory Rate',         '', 'eVitals.RespiratoryRate',    'Respiratory rate (breaths/min)', 'Data Element', 'Clinical', 'Required', 'eVitals.14', 27),
  row('de_evitals_16', 'End Tidal CO2',            '', 'eVitals.ETCO2',              'End tidal CO2 (mmHg)', 'Data Element', 'Clinical', 'Optional', 'eVitals.16', 28),
  row('de_evitals_19', 'GCS Eye',                  '', 'eVitals.GCSEye',             'Glasgow Coma Score — Eye opening', 'Data Element', 'Clinical', 'Recommended', 'eVitals.19', 29),
  row('de_evitals_20', 'GCS Verbal',               '', 'eVitals.GCSVerbal',          'Glasgow Coma Score — Verbal response', 'Data Element', 'Clinical', 'Recommended', 'eVitals.20', 30),
  row('de_evitals_21', 'GCS Motor',                '', 'eVitals.GCSMotor',           'Glasgow Coma Score — Motor response', 'Data Element', 'Clinical', 'Recommended', 'eVitals.21', 31),
  row('de_evitals_26', 'Temperature',              '', 'eVitals.Temperature',        'Body temperature', 'Data Element', 'Clinical', 'Optional', 'eVitals.26', 32),
  row('de_evitals_28', 'Level of Responsiveness',  '', 'eVitals.AVPU',               'AVPU level of responsiveness', 'Data Element', 'Clinical', 'Required', 'eVitals.28', 33),
  row('de_evitals_29', 'Pain Scale Score',         '', 'eVitals.PainScore',          'Patient-reported pain (0–10)', 'Data Element', 'Clinical', 'Recommended', 'eVitals.29', 34),
  // ── eArrest ─────────────────────────────────────────────────────────────────
  row('de_earrest_01', 'Cardiac Arrest',           '', 'eArrest.CardiacArrest',      'Cardiac arrest present', 'Data Element', 'Clinical', 'Required', 'eArrest.01', 35),
  row('de_earrest_02', 'Arrest Etiology',          '', 'eArrest.Etiology',           'Etiology of cardiac arrest', 'Data Element', 'Clinical', 'Recommended', 'eArrest.02', 36),
  row('de_earrest_11', 'First Arrest Rhythm',      '', 'eArrest.FirstRhythm',        'First monitored arrest rhythm', 'Data Element', 'Clinical', 'Recommended', 'eArrest.11', 37),
  // ── eDisposition ────────────────────────────────────────────────────────────
  row('de_edisp_12', 'Patient Disposition',        '', 'eDisposition.Disposition',   'Incident/patient disposition', 'Data Element', 'Administrative', 'Required', 'eDisposition.12', 38),
  row('de_edisp_17', 'Transport Mode from Scene',  '', 'eDisposition.TransportMode', 'Mode of transport from scene', 'Data Element', 'Administrative', 'Required', 'eDisposition.17', 39),
  row('de_edisp_19', 'Final Patient Acuity',       '', 'eDisposition.FinalAcuity',   'Patient acuity at end of EMS care', 'Data Element', 'Clinical', 'Required', 'eDisposition.19', 40),
  // ── eProcedures ─────────────────────────────────────────────────────────────
  row('de_eproc_01', 'Procedure Date/Time',        '', 'eProcedures.DateTime',       'Date/time procedure performed', 'Data Element', 'Clinical', 'Required', 'eProcedures.01', 41),
  row('de_eproc_03', 'Procedure',                  '', 'eProcedures.Procedure',      'Procedure performed', 'Data Element', 'Clinical', 'Required', 'eProcedures.03', 42),
  row('de_eproc_06', 'Procedure Successful',       '', 'eProcedures.Successful',     'Whether procedure was successful', 'Data Element', 'Clinical', 'Required', 'eProcedures.06', 43),
  // ── eMedications ────────────────────────────────────────────────────────────
  row('de_emed_01', 'Medication Date/Time',        '', 'eMedications.DateTime',      'Date/time medication administered', 'Data Element', 'Clinical', 'Required', 'eMedications.01', 44),
  row('de_emed_03', 'Medication Given',            '', 'eMedications.Medication',    'Medication administered', 'Data Element', 'Clinical', 'Required', 'eMedications.03', 45),
  row('de_emed_05', 'Medication Dosage',           '', 'eMedications.Dosage',        'Dosage amount', 'Data Element', 'Clinical', 'Required', 'eMedications.05', 46),
  row('de_emed_06', 'Medication Dosage Units',     '', 'eMedications.DosageUnits',   'Units for dosage', 'Data Element', 'Clinical', 'Required', 'eMedications.06', 47),
];

export async function seed(knex: Knex): Promise<void> {
  // Idempotent — skip if NEMSIS library already exists
  const existing = await knex('libraries').where('id', NEMSIS_LIBRARY_ID).first();
  if (existing) {
    console.log('NEMSIS library already seeded — skipping');
    return;
  }

  await knex('libraries').insert({
    id: NEMSIS_LIBRARY_ID,
    name: 'NEMSIS v3.5',
    icon: '🚑',
    description: 'National EMS Information System v3.5.1 — data elements, NOT values, Pertinent Negatives, and Nillable Markers',
    color: '#0073EA',
    version: '3.5.1',
    source: 'builtin',
    monday_board_id: null,
    columns: JSON.stringify(SYSTEM_COLUMNS),
    categories: ['NOT Value', 'Pertinent Negative', 'Data Element', 'Nillable Marker'],
    sub_categories: ['System', 'Clinical', 'Administrative', 'Operational', 'Patient', 'Documentation'],
    permissions: JSON.stringify({
      canView: ['admin', 'editor', 'viewer'],
      canEdit: ['admin', 'editor'],
      canDelete: ['admin'],
    }),
    is_system: true,
    created_by: null,
  });

  const allRows = [...NOT_VALUES, ...PERTINENT_NEGATIVES, ...NILLABLE, ...DATA_ELEMENTS];
  await knex('library_rows').insert(allRows);

  console.log(`Seeded NEMSIS library with ${allRows.length} rows`);
}
