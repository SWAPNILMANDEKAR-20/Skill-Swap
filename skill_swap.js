document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------------------
    // 1. POST INTERACTION LOGIC (Like, Comment, Share)
    // ------------------------------------------------------------------

    // Like button toggle functionality
    document.querySelectorAll('.like-btn').forEach((likeBtn) => {
        // Use a class to track state instead of a variable
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
            if (likeBtn.classList.contains('liked')) {
                // Change to liked state
                likeBtn.style.background = 'linear-gradient(135deg,rgb(0, 84, 84),rgb(0, 129, 129))';
                likeBtn.style.color = 'white';
                likeBtn.style.transform = 'scale(1.10)'; 
            } else {
                // Revert to original state
                likeBtn.style.background = ''; 
                likeBtn.style.color = ''; 
                likeBtn.style.transform = 'scale(1.0)';
            }
        });
    });

    // Comment button toggle functionality
    document.querySelectorAll('.comment-btn').forEach((button) => {
        button.addEventListener('click', () => {
            // Find the closest parent post-card and then the comment section within it
            const postCard = button.closest('.post-card');
            const commentSection = postCard ? postCard.querySelector('.comment-section') : null;
            
            if (commentSection) {
                // Toggle the visibility
                if (commentSection.style.display === 'block') {
                    commentSection.style.display = 'none';
                } else {
                    commentSection.style.display = 'block';
                    // Focus on the textarea inside the comment section
                    commentSection.querySelector('.comment-box').focus();
                }
            }
        });
    });

    // Handling comment submission and clearing comment box
    document.querySelectorAll('.comment-box').forEach((commentBox) => {
        commentBox.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                // Show the "Comment Posted" message
                const messageDiv = document.createElement('div');
                messageDiv.textContent = "Comment Posted.! 🎉";
                messageDiv.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #ffffff;
                    padding: 20px 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                    font-size: 18px;
                    font-weight: bold;
                    z-index: 9999; /* Ensure it's on top */
                `;

                document.body.appendChild(messageDiv);
                commentBox.value = '';

                setTimeout(() => {
                    messageDiv.remove();
                }, 1000);
            }
        });
    });

    // Share button functionality
    document.querySelectorAll('.share-btn').forEach((shareBtn) => {
        shareBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy link.');
            });
        });
    });
    
    // Join Project button functionality
    // This is for the posts in the center section
    document.querySelectorAll('.center-section .join-btn').forEach((joinBtn) => {
        joinBtn.addEventListener('click', () => {
            // Toggle text and class for visual feedback
            if (joinBtn.textContent.includes('Request')) {
                joinBtn.textContent = 'Request Sent.!';
                joinBtn.classList.add('request-sent');
            } else {
                joinBtn.textContent = 'Request Joining Project';
                joinBtn.classList.remove('request-sent');
            }
        });
    });

    // Follow button logic (toggle between Follow and Following)
    document.querySelectorAll(".follow-btn").forEach(function(followButton) {
        followButton.addEventListener("click", function() {
            if (followButton.classList.contains("following")) {
                followButton.classList.remove("following");
                followButton.innerHTML = "Follow +👤";
                followButton.style.backgroundColor = ""; 
            } else {
                followButton.classList.add("following");
                followButton.innerHTML = "Following ✅";
                followButton.style.backgroundColor = "#28a745"; 
            }
        });
    });

    // ------------------------------------------------------------------
    // 2. MESSAGING LOGIC (Modal Open/Close)
    // ------------------------------------------------------------------

    const messageButtons = document.querySelectorAll(".message-btn");
    const closeButtons = document.querySelectorAll(".close-btn");
    const modals = document.querySelectorAll(".modal");

    // Open Modal
    messageButtons.forEach(button => {
        button.addEventListener("click", () => {
            const modalId = button.getAttribute("data-modal");
            const recipientId = button.getAttribute("data-recipient-id");
            const modal = document.getElementById(modalId);
            
            if (modal) {
                 // **Critical: Set recipient ID on button click**
                const form = modal.querySelector('.message-form');
                const recipientInput = form.querySelector('input[name="recipient_id"]');
                if (recipientInput) {
                    recipientInput.value = recipientId;
                }
                modal.style.display = "block";
            }
        });
    });
    
    // Close Modal by X button
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");
            if (modal) {
                modal.style.display = "none";
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    // ------------------------------------------------------------------
    // 3. MESSAGE SUBMISSION (AJAX to Flask Endpoint)
    // ------------------------------------------------------------------
    const messageForms = document.querySelectorAll('.message-form');

    messageForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const recipientId = form.querySelector('input[name="recipient_id"]').value;
            const messageBody = form.querySelector('textarea[name="message_body"]').value.trim();

            if (!messageBody) {
                alert('Please enter a message.');
                return;
            }

            try {
                // Get the text from the modal's <h2> tag for a nice alert message
                const recipientName = form.closest('.modal-content').querySelector('h2').textContent.replace('Send a Message to ', '');

                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'recipient_id': recipientId,
                        'message_body': messageBody
                    })
                });

                if (response.ok) {
                    // Success!
                    alert(`Message successfully sent to ${recipientName}! It has been saved to the database.`);
                    // Clear the textarea and close the modal
                    form.querySelector('textarea[name="message_body"]').value = '';
                    form.closest('.modal').style.display = 'none';
                } else {
                    // Error from Flask server (e.g., missing data, database error)
                    const errorText = await response.text();
                    alert(`Failed to send message. Server response: ${errorText}`);
                }
            } catch (error) {
                console.error('Network Error:', error);
                alert('A network error occurred. Could not connect to the server.');
            }
        });
    });

});

// Function for Project Card (Right Section) - Kept from original code
function toggleJoinText(button) {
    if (button.textContent === 'Join Project') {
        button.textContent = 'Request Sent!';
        button.disabled = true;
    } else {
        // This part seems to have conflicting logic with the center-section logic, 
        // but is preserved here as originally written for the right section.
        button.textContent = 'Join Project';
        button.disabled = false;
    }
}