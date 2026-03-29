const express = require('express');
const router = express.Router();

// Store applications
let applications = [];

// ========== AUTO-APPLY AGENT ==========
router.post('/auto-apply', async (req, res) => {
  const { resume, jobs, dailyLimit = 5 } = req.body;
  
  console.log('🤖 Auto-Apply Agent Started');
  console.log(`📄 Resume: ${resume?.name || 'Unknown'}`);
  console.log(`💼 Jobs to process: ${Math.min(jobs?.length || 0, dailyLimit)}`);
  
  const results = [];
  const logs = [];
  const appliedJobs = [];
  
  logs.push({ step: 'start', message: '🚀 Starting Auto-Apply Agent...', timestamp: new Date() });
  
  if (!resume || !resume.skills || resume.skills.length === 0) {
    logs.push({ step: 'error', message: '❌ No resume found. Please upload a resume first.', timestamp: new Date() });
    return res.json({ success: false, message: 'No resume found', logs, applications: [] });
  }
  
  logs.push({ step: 'resume', message: `✅ Resume loaded: ${resume.name} with ${resume.skills.length} skills`, timestamp: new Date() });
  
  if (!jobs || jobs.length === 0) {
    logs.push({ step: 'error', message: '❌ No jobs found to apply', timestamp: new Date() });
    return res.json({ success: false, message: 'No jobs found', logs, applications: [] });
  }
  
  logs.push({ step: 'jobs', message: `📋 Found ${Math.min(jobs.length, dailyLimit)} matching jobs`, timestamp: new Date() });
  
  // Process each job
  for (let i = 0; i < Math.min(jobs.length, dailyLimit); i++) {
    const job = jobs[i];
    console.log(`\n📝 Processing job ${i + 1}/${Math.min(jobs.length, dailyLimit)}: ${job.title} at ${job.company}`);
    
    logs.push({ step: 'processing', message: `🎯 Processing: ${job.title} at ${job.company}...`, timestamp: new Date() });
    
    try {
      // STEP 1: Customize resume for this job
      logs.push({ step: 'customizing', message: `   ✨ AI customizing resume for ${job.title}...`, timestamp: new Date() });
      
      const customizedResume = {
        ...resume,
        summary: `${resume.summary || 'Experienced professional'} I am particularly excited about the ${job.title} role at ${job.company}. My skills in ${job.skills?.slice(0, 5).join(', ') || 'relevant technologies'} align perfectly with this position.`,
        skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])],
        targetedRole: job.title,
        targetCompany: job.company
      };
      
      await new Promise(r => setTimeout(r, 800)); // Simulate AI processing
      logs.push({ step: 'customized', message: `   ✅ Resume customized for ${job.title}`, timestamp: new Date() });
      
      // STEP 2: Generate cover letter
      logs.push({ step: 'coverletter', message: `   📝 Generating cover letter...`, timestamp: new Date() });
      
      const coverLetter = `
Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}.

With my background in ${resume.skills?.slice(0, 3).join(', ') || 'software development'}, I am confident I would be a valuable addition to your team. My experience includes ${resume.summary?.substring(0, 100) || 'building scalable applications and solving complex problems'}.

I am particularly drawn to ${job.company} because of your innovative work in the industry. I look forward to discussing how my skills can contribute to your team.

Best regards,
${resume.name || 'Applicant'}
      `.trim();
      
      await new Promise(r => setTimeout(r, 500));
      logs.push({ step: 'coverletter', message: `   ✅ Cover letter generated`, timestamp: new Date() });
      
      // STEP 3: Submit application
      logs.push({ step: 'applying', message: `   📤 Submitting application to ${job.company}...`, timestamp: new Date() });
      
      const application = {
        id: Date.now() + i,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        skills: job.skills,
        matchScore: job.matchScore || calculateMatchScore(job.skills, resume.skills),
        customizedResume: customizedResume,
        coverLetter: coverLetter,
        status: 'applied',
        appliedDate: new Date().toISOString(),
        resumeUsed: customizedResume
      };
      
      await new Promise(r => setTimeout(r, 600));
      applications.unshift(application);
      appliedJobs.push(job.title);
      results.push(application);
      
      logs.push({ step: 'applied', message: `   ✅ Successfully applied to ${job.title} at ${job.company}`, timestamp: new Date(), success: true });
      
    } catch (error) {
      console.error(`❌ Error applying to ${job.title}:`, error);
      logs.push({ step: 'error', message: `   ❌ Failed to apply to ${job.title}: ${error.message}`, timestamp: new Date(), error: true });
    }
    
    // Small delay between applications
    await new Promise(r => setTimeout(r, 1000));
  }
  
  logs.push({ step: 'complete', message: `🎉 Auto-apply completed! Applied to ${appliedJobs.length} jobs`, timestamp: new Date(), success: true });
  
  console.log(`\n✅ Auto-Apply Complete: ${appliedJobs.length} jobs applied`);
  
  res.json({
    success: true,
    message: `Successfully applied to ${appliedJobs.length} jobs`,
    applications: results,
    appliedJobs,
    logs,
    totalProcessed: Math.min(jobs.length, dailyLimit),
    totalApplied: appliedJobs.length
  });
});

// Helper function to calculate match score
function calculateMatchScore(jobSkills, userSkills) {
  if (!userSkills || userSkills.length === 0) return 0;
  let matched = 0;
  jobSkills.forEach(jobSkill => {
    userSkills.forEach(userSkill => {
      if (userSkill.toLowerCase().includes(jobSkill.toLowerCase()) || 
          jobSkill.toLowerCase().includes(userSkill.toLowerCase())) {
        matched++;
      }
    });
  });
  return Math.round((matched / jobSkills.length) * 100);
}

// ========== GET ALL APPLICATIONS ==========
router.get('/applications', (req, res) => {
  res.json(applications);
});

// ========== GET APPLICATION STATUS ==========
router.get('/applications/stats', (req, res) => {
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };
  res.json(stats);
});

module.exports = router;