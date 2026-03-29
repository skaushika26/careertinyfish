const { v4: uuidv4 } = require('uuid');

// In-memory store
const applicationStore = new Map();

exports.getApplications = async (req, res) => {
  const apps = Array.from(applicationStore.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(apps);
};

exports.createApplication = async (req, res) => {
  const app = {
    id: uuidv4(),
    ...req.body,
    status: req.body.status || 'saved',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  applicationStore.set(app.id, app);
  res.status(201).json(app);
};

exports.updateApplication = async (req, res) => {
  const app = applicationStore.get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const updated = { ...app, ...req.body, updatedAt: new Date() };
  applicationStore.set(req.params.id, updated);
  res.json(updated);
};

exports.deleteApplication = async (req, res) => {
  if (!applicationStore.has(req.params.id)) {
    return res.status(404).json({ error: 'Application not found' });
  }
  applicationStore.delete(req.params.id);
  res.json({ success: true });
};

exports.applyToJob = async (req, res) => {
  const app = applicationStore.get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const updated = { ...app, status: 'applied', appliedAt: new Date(), updatedAt: new Date() };
  applicationStore.set(req.params.id, updated);
  res.json(updated);
};
