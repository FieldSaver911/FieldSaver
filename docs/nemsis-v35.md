# NEMSIS v3.5.1 Data Reference

## Overview

NEMSIS (National EMS Information System) v3.5.1 is the US standard for EMS data collection. FieldSaver targets NEMSIS-compliant export — each field's `exportKey` maps directly to a NEMSIS element path.

## Element Path Format

NEMSIS element paths follow the pattern: `e<Section>.<ElementName>`

Examples:
- `eVitals.06` — Systolic Blood Pressure
- `ePatient.13` — Gender
- `eTimes.09` — Unit Arrived on Scene Date/Time

## Built-in Library Categories

### NOT Values (3 rows)
These represent "why data is absent." Stored as XML attributes on NEMSIS elements.

| Code | Export Key | Label |
|------|-----------|-------|
| 7701001 | notApplicable | Not Applicable |
| 7701003 | notRecorded | Not Recorded |
| 7701005 | notReporting | Not Reporting |

### Pertinent Negatives (15 rows)
Clinical observations that are explicitly absent. Stored as `PN` values in NEMSIS.

| Code | Export Key | Label |
|------|-----------|-------|
| 8801001 | contraindicationNoted | Contraindication Noted |
| 8801003 | deniedByOrder | Denied By Order |
| 8801005 | exemptFromProtocol | Exempt from Protocol |
| 8801007 | inadvertentlyOmitted | Inadvertently Omitted |
| 8801009 | medicationAllergyPresent | Medication Allergy |
| 8801011 | medicationAlreadyTaken | Medication Already Taken |
| 8801013 | noProblemFound | No Problem Found |
| 8801015 | none | None |
| 8801017 | notApplicable | Not Applicable |
| 8801019 | refused | Refused |
| 8801021 | unresponsive | Unresponsive |
| 8801023 | unableToComplete | Unable to Complete |
| 8801025 | orderCriteriaNotMet | Order Criteria Not Met |
| 8801027 | symptomNotPresent | Symptom Not Present |
| 8801031 | patientsConditionContraindicated | Patient's Condition Contraindicated |

### Nillable Marker (1 row)
When a field is nillable and left blank, this value is submitted as `xsi:nil="true"`.

| Export Key | Label |
|-----------|-------|
| xsiNil | Nillable (xsi:nil) |

### Data Elements (~88 rows)

#### eResponse (EMS Agency/Response)
- eResponse.AgencyNumber, eResponse.IncidentNumber, eResponse.UnitNumber
- eResponse.IncidentDate, eResponse.ComplaintReportedByDispatch
- eResponse.TypeOfService, eResponse.ModeOfTransport

#### eTimes (Timestamps)
- eTimes.01 — PSAP Call Date/Time
- eTimes.05 — Unit Notified Date/Time  
- eTimes.06 — Dispatch Acknowledged Date/Time
- eTimes.07 — Unit En Route Date/Time
- eTimes.08 — Unit Arrived on Scene Date/Time (eTimes.09 in some versions)
- eTimes.11 — Arrived at Patient Date/Time
- eTimes.12 — Transfer of EMS Care Date/Time
- eTimes.13 — Unit Left Scene Date/Time
- eTimes.15 — Arrived at Destination Date/Time
- eTimes.20 — Patient Arrived at Destination Date/Time
- eTimes.21 — Unit Back In Service Date/Time

#### eDispatch (Dispatch)
- eDispatch.01 — Complaint Reported by Dispatch
- eDispatch.05 — EMD Performed
- eDispatch.06 — EMD Card Number

#### eScene (Scene/Location)
- eScene.01 — First EMS Unit on Scene
- eScene.06 — Number of Patients at Scene
- eScene.07 — Mass Casualty Incident
- eScene.08 — Incident Location Type
- eScene.09 — Incident Facility Code
- eScene.15 — State
- eScene.17 — GPS Latitude/Longitude
- eScene.21 — Scene Cross Street

#### ePatient (Patient Demographics)
- ePatient.02 — Last Name
- ePatient.03 — First Name
- ePatient.04 — Middle Initial/Name
- ePatient.07 — Patient's Home County
- ePatient.08 — Patient's Home State
- ePatient.09 — Patient's Home ZIP Code
- ePatient.13 — Gender
- ePatient.14 — Race
- ePatient.15 — Age
- ePatient.16 — Age Units
- ePatient.17 — Date of Birth
- ePatient.18 — Patient's Phone Number
- ePatient.20 — State Issuing Driver's License
- ePatient.21 — Driver's License Number

#### eSituation (Patient Situation)
- eSituation.02 — Date/Time of Symptom Onset
- eSituation.07 — Chief Complaint Anatomic Location
- eSituation.08 — Chief Complaint Organ System
- eSituation.09 — Primary Symptom
- eSituation.10 — Other Associated Symptoms
- eSituation.11 — Provider's Primary Impression
- eSituation.12 — Provider's Secondary Impressions
- eSituation.13 — Initial Patient Acuity
- eSituation.18 — Reason for Interfacility Transfer

#### eVitals (Vital Signs)
- eVitals.01 — Date/Time Vital Signs Taken
- eVitals.02 — Obtained Prior to this Unit's EMS Care
- eVitals.06 — SBP (Systolic Blood Pressure)
- eVitals.07 — DBP (Diastolic Blood Pressure)
- eVitals.08 — Method of Blood Pressure Measurement
- eVitals.09 — Heart Rate
- eVitals.10 — Method of Heart Rate Measurement
- eVitals.12 — Pulse Oximetry
- eVitals.14 — Respiratory Rate
- eVitals.16 — End Tidal CO2
- eVitals.19 — Glasgow Coma Score (Eye)
- eVitals.20 — Glasgow Coma Score (Verbal)
- eVitals.21 — Glasgow Coma Score (Motor)
- eVitals.22 — Glasgow Coma Score Qualifier
- eVitals.24 — Stroke Scale Score
- eVitals.26 — Temperature
- eVitals.27 — Temperature Method
- eVitals.28 — Level of Responsiveness (AVPU)
- eVitals.29 — Pain Scale Score

#### eHistory (Medical History)
- eHistory.01 — Barriers to Patient Care
- eHistory.06 — Last Oral Intake
- eHistory.07 — Medical/Surgical History
- eHistory.08 — Medical History Obtained From
- eHistory.09 — Presence of Emergency Information Form
- eHistory.10 — Alcohol/Drug Use Indicators
- eHistory.17 — Current Medications
- eHistory.20 — Immunization Year

#### eProcedures (Interventions)
- eProcedures.01 — Date/Time Procedure Performed
- eProcedures.02 — Performed Prior to this Unit's EMS Care
- eProcedures.03 — Procedure
- eProcedures.05 — Number of Procedure Attempts
- eProcedures.06 — Procedure Successful
- eProcedures.07 — Procedure Complication
- eProcedures.08 — Response to Procedure
- eProcedures.10 — Role/Type of Person Performing Procedure
- eProcedures.12 — Vascular Access Location

#### eMedications (Medications)
- eMedications.01 — Date/Time Medication Administered
- eMedications.03 — Medication Given
- eMedications.04 — Medication Administered Prior to this Unit's EMS Care
- eMedications.05 — Medication Dosage
- eMedications.06 — Medication Dosage Units
- eMedications.07 — Response to Medication
- eMedications.08 — Medication Complication
- eMedications.10 — Role/Type of Person Administering Medication
- eMedications.11 — Medication Authorization

#### eArrest (Cardiac Arrest)
- eArrest.01 — Cardiac Arrest
- eArrest.02 — Cardiac Arrest Etiology
- eArrest.03 — Resuscitation Attempted By EMS
- eArrest.04 — Arrest Witnessed By
- eArrest.07 — AED Use Prior to EMS Arrival
- eArrest.11 — First Monitored Arrest Rhythm of the Patient
- eArrest.14 — Date/Time of Cardiac Arrest
- eArrest.16 — Reason CPR/Resuscitation Discontinued
- eArrest.17 — Cardiac Arrest Data Source
- eArrest.18 — Disposition at End of EMS Event

#### eDisposition (Destination/Transport)
- eDisposition.12 — Incident/Patient Disposition
- eDisposition.13 — How Patient Was Transported
- eDisposition.14 — Transport Destination
- eDisposition.16 — Transport Disposition
- eDisposition.17 — Transport Mode from Scene
- eDisposition.19 — Final Patient Acuity
- eDisposition.21 — Type of Destination
- eDisposition.22 — Hospital In-Patient Destination
- eDisposition.24 — Destination Team Pre-Notification
- eDisposition.28 — Unit Disposition at Destination

#### eOutcome (Patient Outcome)
- eOutcome.01 — Emergency Department Disposition
- eOutcome.02 — Hospital Disposition
- eOutcome.09 — Emergency Medical Condition

## Export Key Naming Convention

Export keys in FieldSaver use camelCase versions of the NEMSIS element names:
- `eVitals.06` → `eVitals.SBP`
- `ePatient.13` → `ePatient.Gender`
- `eTimes.09` → `eTimes.UnitArrivedOnScene`

## NOT Value vs. Data Element in Export

When a NOT Value is selected:
```json
{
  "eVitals.SBP": null,
  "eVitals.SBP_notValue": "notRecorded"
}
```

When a Pertinent Negative is selected:
```json
{
  "eVitals.SBP": "8801019"
}
```

When `isNillable` is true and field is blank:
```json
{
  "eVitals.SBP": { "xsiNil": true }
}
```
