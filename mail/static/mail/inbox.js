document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        load_mailbox('sent');
    });
    return false;
  };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log(mailbox);
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      
      for (let email of emails) {
        
        let email_div = document.createElement('div');
        
        email_div.setAttribute(`id`, `div_${email['id']}`);
        email_div.setAttribute("class", `email-holder row d-flex`);
        document.querySelector('#emails-view').append(email_div);
        document.querySelector(`#div_${email['id']}`).style.border = "thick solid black";
        
        
        let email_sender = document.createElement('span');
        let email_subject = document.createElement('span');
        let email_time = document.createElement('span');
        
        email_sender.innerHTML = email['sender'];
        email_subject.innerHTML =  email['subject'];
        email_time.innerHTML = email['timestamp'];

        email_sender.setAttribute("class", "p-2 font-weight-bold");
        email_subject.setAttribute("class", "p-2");
        email_time.setAttribute("class", "ml-auto p-2");

        email_div.appendChild(email_sender);
        email_div.appendChild(email_subject);
        email_div.appendChild(email_time);
      
        if (email['read'] == true) {
          document.querySelector(`#div_${email['id']}`).style.backgroundColor = "gray";
        } else {
          document.querySelector(`#div_${email['id']}`).style.backgroundColor = "white";
        }
        email_div.addEventListener('click', function() {
          console.log(`This element has been clicked!'+ ${email['id']}`);
          load_mail(email, mailbox);
        });
        
      }
  });

}

function load_mail(email, mailbox) {
  console.log(email);
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'block';
  
  let email_content = document.createElement('div');
  email_content.setAttribute('id', `${email['id']}`);
  document.querySelector('#email-content').innerHTML = "";
  document.querySelector('#email-content').append(email_content);
  let from = document.createElement('span');
  let to = document.createElement('span');
  let subject = document.createElement('span');
  let timestamp = document.createElement('span');
  let body = document.createElement('span');
  const archive_button = document.createElement("BUTTON");
  archive_button.setAttribute("id", `button_${email['id']}`);
  const sent_button = document.createElement('BUTTON');
  sent_button.setAttribute("id", `sent_${email['id']}`);
  const sent = document.createTextNode('sent');
  sent_button.append(sent);

  if (mailbox !== 'sent') {
    if (email['archived'] == true) {
      const archive = document.createTextNode("unarchive");
      archive_button.append(archive);
    } else {
      const archive = document.createTextNode("archive");
      archive_button.append(archive);
    }
  }
  
  
  
  from.innerHTML = `From: ${email['sender']} <br>`;
  to.innerHTML = `To: ${email['recipients']} <br>`;
  subject.innerHTML = `Subject: ${email['subject']} <br>`;
  timestamp.innerHTML = `Timestamp: ${email['timestamp']} <br>`;
  body.innerHTML = `Body: ${email['body']} <br>`;

  email_content.appendChild(from);
  email_content.appendChild(to);
  email_content.appendChild(subject);
  email_content.appendChild(timestamp);
  email_content.appendChild(body);
  email_content.appendChild(sent_button);
  
  if (mailbox !== 'sent') {
    email_content.appendChild(archive_button);
    arch = document.querySelector(`#button_${email['id']}`);
    arch.addEventListener('click', () => {
      if (email['archived'] == true) {
        fetch(`/emails/${email['id']}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
        
      } else {
        fetch(`/emails/${email['id']}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
        
      }
      
    });
  }
  sent_data = document.querySelector(`#sent_${email['id']}`);
  sent_data.addEventListener('click', () => {
    compose_email();
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-content').style.display = 'none';
    if(email["subject"].slice(0,4) != "Re: "){
      email["subject"] = `Re: ${email["subject"]}`;
    }

    document.querySelector('#compose-recipients').value = email["sender"];
    document.querySelector('#compose-subject').value = `${email["subject"]}`;
    document.querySelector('#compose-body').value = `On ${email["timestamp"]} ${email["sender"]} wrote:\n${email["body"]}\n\n`;
  

  });

  
  fetch(`/emails/${email['id']}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
}