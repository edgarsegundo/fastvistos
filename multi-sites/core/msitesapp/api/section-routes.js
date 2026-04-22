import express from 'express';
const router = express.Router();

export default (WebPageService) => {
  // POST endpoint to create a WebPageSection and Version
  router.post('/webpage-section', async (req, res) => {
    try {
      const {
        webpageRelativePath,
        title,
        updatableUuid,
        businessId,
        htmlContent,
        siteId,
        isFirstClone = false,
      } = req.body;
      if (
        !webpageRelativePath ||
        !title ||
        !updatableUuid ||
        !businessId ||
        !htmlContent ||
        !siteId
      ) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
      const result = await WebPageService.createSectionAndVersion({
        webpageRelativePath,
        title,
        updatableUuid,
        businessId,
        htmlContent,
        siteId,
        isFirstClone,
      });
      res.json(result);
    } catch (error) {
      console.error('Error in /webpage-section:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // POST endpoint to update a WebPageSection and Version
  router.post('/update-section-file-version', async (req, res) => {
    try {
      const { webPageSectionVersionId, siteId, htmlContent } = req.body;
      if (!webPageSectionVersionId || !siteId || !htmlContent) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
      const result = await WebPageService.updateSectionFileContent({
        webPageSectionVersionId,
        siteId,
        htmlContent,
      });
      res.json(result);
    } catch (error) {
      console.error('Error in /update-section-file-version:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // POST endpoint to publish a WebPageSection and Version
  router.post('/publish-section', async (req, res) => {
    try {
      const { updatableUuid, webpageRelativePath, businessId, htmlContent, siteId, versionId } = req.body;
      if (!webpageRelativePath || !updatableUuid || !businessId || !htmlContent || !siteId) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
      const result = await WebPageService.publishSection({
        webpageRelativePath,
        updatableUuid,
        businessId,
        versionId,
      });
      // Backup logic
      const originalPath = webpageRelativePath.replace(/(\.[^/.]+)$/, '.original');
      const fs = await import('fs').then((mod) => mod.promises);
      try {
        await fs.access(originalPath);
        console.log(`Backup already exists: ${originalPath}`);
      } catch {
        await fs.copyFile(webpageRelativePath, originalPath);
        console.log(`Created backup of original file at: ${originalPath}`);
      }
      let fileData = await fs.readFile(webpageRelativePath, 'utf-8');
      const uuidRegex = new RegExp(
        `<div[^>]*\\bupdatable-section-uuid=["']${updatableUuid}["'][^>]*>([\\s\\S]*?)<\\/div>`,
        'i'
      );
      fileData = fileData.replace(uuidRegex, (match, innerContent) => {
        return match.replace(innerContent, htmlContent);
      });
      await fs.writeFile(webpageRelativePath, fileData, 'utf-8');
      // Build and deploy
      const { exec } = await import('child_process');
      function runBuild() {
        return new Promise((resolve, reject) => {
          exec(
            'npm run build:fastvistos',
            {
              cwd: process.cwd(),
              env: process.env,
            },
            (error, stdout, stderr) => {
              if (error) return reject({ error: error.message, stdout, stderr });
              resolve({ stdout, stderr });
            }
          );
        });
      }
      let buildOutput = null;
      try {
        buildOutput = await runBuild();
        const deployScriptPath = '/home/edgar/Repos/fastvistos/deploy-site-vps.sh';
        const deployCmd = `sudo ${deployScriptPath} ${siteId}`;
        await new Promise((resolve, reject) => {
          exec(
            deployCmd,
            {
              cwd: process.cwd(),
              env: process.env,
            },
            (error, stdout, stderr) => {
              if (error) return reject({ error: error.message, stdout, stderr });
              resolve({ stdout, stderr });
            }
          );
        });
      } catch (buildErr) {
        return res.status(500).json({ ...result, buildError: buildErr });
      }
      res.json({ ...result, buildOutput });
    } catch (error) {
      console.error('Error in /publish-section:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // GET endpoint to fetch all versions for a section by uuid and businessId
  router.get('/page-section-versions', async (req, res) => {
    try {
      const { 'updatable-section-uuid': updatableSectionUuid, 'business-id': businessId } = req.query;
      if (!updatableSectionUuid || typeof updatableSectionUuid !== 'string' || !businessId || typeof businessId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid updatable-section-uuid or businessId query param.' });
      }
      const versions = await WebPageService.getPageSectionVersions({
        updatableSectionUuid,
        businessId,
      });
      res.json({ versions });
    } catch (error) {
      console.error('Error in /page-section-versions:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.get('/page-section-version', async (req, res) => {
    try {
      const { 'site-id': siteId, id } = req.query;
      if (!id || typeof id !== 'string' || !siteId || typeof siteId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid id or siteId query param.' });
      }
      const version = await WebPageService.getPageSectionVersionById({
        id,
        siteId,
      });
      res.json({ version });
    } catch (error) {
      console.error('Error in /page-section-version:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.delete('/page-section-version', async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing or invalid id query param.' });
      }
      const result = await WebPageService.removePageSectionVersionById({ id });
      res.json(result);
    } catch (error) {
      console.error('Error in /page-section-version:', error);
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  return router;
};
