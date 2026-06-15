document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const messageContainer = document.getElementById('message-container');
    const submitBtn = document.getElementById('submit-btn');
    
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        messageContainer.innerHTML = '';
        
        const formData = new FormData(uploadForm);
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        
        try {
            const response = await fetch('/student/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                messageContainer.innerHTML = `
                    <div class="success-message">
                        <h3 style="margin-bottom: 10px;">✓ Resume Submitted Successfully!</h3>
                        <p>Thank you for applying! Our recruitment team will review your application and contact you if you're shortlisted for the next round.</p>
                        <p style="margin-top: 15px;"><strong>What's next?</strong></p>
                        <ul style="text-align: left; margin-top: 10px;">
                            <li>Your resume has been received and stored securely</li>
                            <li>We'll evaluate all applications carefully</li>
                            <li>Shortlisted candidates will be contacted via email</li>
                        </ul>
                    </div>
                `;
                
                uploadForm.reset();
            } else {
                messageContainer.innerHTML = `
                    <div class="error-message">
                        ${data.error || 'Upload failed. Please try again.'}
                    </div>
                `;
            }
        } catch (error) {
            messageContainer.innerHTML = `
                <div class="error-message">
                    An error occurred while uploading your resume. Please try again.
                </div>
            `;
            console.error('Upload error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Resume';
        }
    });
});
