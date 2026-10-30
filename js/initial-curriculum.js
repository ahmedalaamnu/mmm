/**
 * INITIAL MEDICAL CURRICULUM
 * Exact structure according to Fourth Year Medical curriculum specifications.
 * Stable unique IDs are generated for subjects, branches, and lectures.
 */

export const INITIAL_CURRICULUM = [
  {
    id: 'subj_pediatrics',
    title: 'Pediatrics',
    order: 1,
    branches: [
      {
        id: 'ped_b1',
        title: 'Neonatology',
        lectures: [
          { id: 'ped_b1_l1', title: 'Respiratory Distress', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b1_l2', title: 'Neonatal Sepsis & Congenital Infections', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b1_l3', title: 'Apgar Score', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b1_l4', title: 'Jaundice', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b2',
        title: 'Nutritional Disorders',
        lectures: [
          { id: 'ped_b2_l1', title: 'Growth and Development', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b2_l2', title: 'Protein Energy Malnutrition', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b2_l3', title: 'Rickets', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b2_l4', title: 'Infant Feeding', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b3',
        title: 'Respiratory',
        lectures: [
          { id: 'ped_b3_l1', title: 'Pneumonia', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b3_l2', title: 'Pleural Diseases', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b3_l3', title: 'Upper Respiratory Diseases', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b4',
        title: 'Hematology',
        lectures: [
          { id: 'ped_b4_l1', title: 'Coagulation Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b4_l2', title: 'Platelet Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b4_l3', title: 'Anemia & Hemolytic Anemia (Combined lecture)', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b5',
        title: 'Gastroenterology',
        lectures: [
          { id: 'ped_b5_l1', title: 'Oral Cavity', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b5_l2', title: 'Constipation & GI Bleeding', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b5_l3', title: 'Acute & Chronic Diarrhea', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b5_l4', title: 'Vomiting', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b6',
        title: 'Cardiology',
        lectures: [
          { id: 'ped_b6_l1', title: 'Introduction to Pediatric Cardiology', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b6_l2', title: 'Acyanotic Congenital Heart Disease', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b6_l3', title: 'Congenital Cyanotic Heart Disease', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b6_l4', title: 'Heart Failure & Obstructive Lesions', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b6_l5', title: 'Rheumatic Heart Disease', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b6_l6', title: 'Infective Endocarditis', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b7',
        title: 'Nephrology',
        lectures: [
          { id: 'ped_b7_l1', title: 'UTI and VUR', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b7_l2', title: 'Hematuria & Glomerulonephritis', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b7_l3', title: 'Polycystic Kidney Disease', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b7_l4', title: 'Proteinuria & Nephrotic Syndrome', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b8',
        title: 'Neurology',
        lectures: [
          { id: 'ped_b8_l1', title: 'Seizures & Epilepsy', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b8_l2', title: 'Cerebral Palsy & Neurodegenerative Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b8_l3', title: 'CNS Anomalies', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b8_l4', title: 'Neuromuscular Diseases', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b9',
        title: 'Endocrine & Adolescence',
        lectures: [
          { id: 'ped_b9_l1', title: 'Endocrine Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b9_l2', title: 'Adrenal Gland', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b9_l3', title: 'Puberty & Its Abnormalities', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b9_l4', title: 'Thyroid & Parathyroid Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b9_l5', title: 'Diabetes Mellitus', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b10',
        title: 'Infection',
        lectures: [
          { id: 'ped_b10_l1', title: 'Bacterial Meningitis', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b10_l2', title: 'Bacterial Infections', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b10_l3', title: 'Viral Infections', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b11',
        title: 'Allergy',
        lectures: [
          { id: 'ped_b11_l1', title: 'Bronchial Asthma', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b12',
        title: 'Rheumatology',
        lectures: [
          { id: 'ped_b12_l1', title: 'Juvenile Idiopathic Arthritis (JIA)', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b12_l2', title: 'Childhood SLE', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b12_l3', title: 'Vasculitis and HSP', completed: false, completedAt: null, notes: '' },
          { id: 'ped_b12_l4', title: 'Kawasaki Disease', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b13',
        title: 'Immunology',
        lectures: [
          { id: 'ped_b13_l1', title: 'Approach to Immunodeficiency', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b14',
        title: 'Oncology',
        lectures: [
          { id: 'ped_b14_l1', title: 'Leukemia & Lymphoma', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b15',
        title: 'Genetics',
        lectures: [
          { id: 'ped_b15_l1', title: 'Genetic Syndromes', completed: false, completedAt: null, notes: '' }
        ]
      },
      {
        id: 'ped_b16',
        title: 'Hepatology',
        lectures: [
          { id: 'ped_b16_l1', title: 'Hepatology', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_anesthesia',
    title: 'Anesthesia',
    order: 2,
    branches: [
      {
        id: 'anes_b1',
        title: 'General Anesthesia & Perioperative Care',
        lectures: [
          { id: 'anes_b1_l1', title: 'Preoperative Care', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l2', title: 'General Anesthesia', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l3', title: 'Regional Anaesthesia', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l4', title: 'Intraoperative Anesthetic Risk', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l5', title: 'Basic Monitoring', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l6', title: 'Airway Management', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l7', title: 'Basic Life Support', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l8', title: 'Postoperative Pain Management', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l9', title: 'Postoperative Complications 1 & 2', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l10', title: 'Fluid Therapy', completed: false, completedAt: null, notes: '' },
          { id: 'anes_b1_l11', title: 'Oxygen Therapy', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_psychiatry',
    title: 'Psychiatry',
    order: 3,
    branches: [
      {
        id: 'psych_b1',
        title: 'Psychiatry Lectures',
        lectures: [
          { id: 'psych_b1_l1', title: 'Anxiety Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l2', title: 'Depressive, Bipolar, and Related Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l3', title: 'Schizophrenia and Other Psychotic Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l4', title: 'Somatic Symptom and Related Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l5', title: 'Eating Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l6', title: 'Adjustment Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l7', title: 'Substance Use Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l8', title: 'Suicide', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l9', title: 'Psychopharmacology', completed: false, completedAt: null, notes: '' },
          { id: 'psych_b1_l10', title: 'Normal Sleep and Sleep Disorders', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_tropical',
    title: 'Tropical Medicine',
    order: 4,
    branches: [
      {
        id: 'trop_b1',
        title: 'Tropical Medicine Lectures',
        lectures: [
          { id: 'trop_b1_l1', title: 'Approach to Fever', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l2', title: 'Travel Medicine & Immunization', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l3', title: 'Nosocomial Infection', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l4', title: 'Heat Disorders', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l5', title: 'Tropical Infections', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l6', title: 'H. pylori', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l7', title: 'Salmonellosis & Brucellosis', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l8', title: 'HIV & Opportunistic Infections', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l9', title: 'CMV, Tetanus & Rabies', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l10', title: 'Gastrointestinal Infections', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l11', title: 'Abdominal Tuberculosis', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l12', title: 'Fever of Unknown Origin', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l13', title: 'Emerging Infections (COVID-19)', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l14', title: 'Acute Viral Hepatitis', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l15', title: 'Chronic HBV & HCV', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l16', title: 'Portal Hypertension', completed: false, completedAt: null, notes: '' },
          { id: 'trop_b1_l17', title: 'Acute Liver Failure', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'subj_rheumatology',
    title: 'Rheumatology',
    order: 5,
    branches: [
      {
        id: 'rheum_b1',
        title: 'Rheumatology Lectures',
        lectures: [
          { id: 'rheum_b1_l1', title: 'Rheumatoid Arthritis', completed: false, completedAt: null, notes: '' },
          { id: 'rheum_b1_l2', title: 'SLE', completed: false, completedAt: null, notes: '' },
          { id: 'rheum_b1_l3', title: 'Spondyloarthropathies', completed: false, completedAt: null, notes: '' },
          { id: 'rheum_b1_l4', title: 'Systemic Sclerosis', completed: false, completedAt: null, notes: '' },
          { id: 'rheum_b1_l5', title: 'Crystal-Induced Arthritis', completed: false, completedAt: null, notes: '' },
          { id: 'rheum_b1_l6', title: 'Inflammatory Myopathies', completed: false, completedAt: null, notes: '' }
        ]
      }
    ]
  }
];

export const DEFAULT_EXAM_DATE = '2027-02-19T09:00:00';

