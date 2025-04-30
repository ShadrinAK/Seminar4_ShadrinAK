document.addEventListener('DOMContentLoaded', function() {
  // ==================== КОНФИГУРАЦИЯ ====================
  const DEEPSEEK_API_KEY = "sk-bb5b025acb36482898d43888f88d1d8f"; //  ЗАМЕНИТЕ НА ВАШ КЛЮЧ!
  const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

  // ==================== DOM-ЭЛЕМЕНТЫ ====================
  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modal-form');
  const closeBtn = document.querySelector('.close');
  
  // Элементы чат-бота
  const chatbotButton = document.getElementById('chatbot-button');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.querySelector('.chatbot-close');
  const chatbotSend = document.getElementById('chatbot-send');
  const userInput = document.getElementById('chatbot-user-input');
  const messagesContainer = document.getElementById('chatbot-messages');

  // ==================== ЗАГОТОВЛЕННЫЕ ОТВЕТЫ ====================
  const fallbackAnswers = {
    "привет": "Привет! Я ваш помощник на платформе волонтеров.",
    "как добавить волонтера": "1. Нажмите 'Добавить волонтера'\n2. Заполните форму\n3. Сохраните",
    "как создать мероприятие": "1. Перейдите в 'Мероприятия'\n2. Нажмите 'Создать'\n3. Укажите детали",
    "как отметить участие": "1. Найдите участие в списке\n2. Нажмите 'Редактировать'\n3. Отметьте галочкой",
    "default": "Сервис временно недоступен. Попробуйте позже."
  };

  // ==================== ФУНКЦИИ ЧАТ-БОТА ====================
  window.getBotResponse = async function(userMessage) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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" // Ваш ключ
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          {
            role: "system",
            content: "Ты помощник волонтерской платформы. Отвечай кратко."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Ошибка:", error);
    return "Сервис временно недоступен";
  }
};

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
  }

  async function handleChatMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    const loadingMsg = addMessage("Помощник печатает...", 'bot');
    const response = await getBotResponse(message);
    
    messagesContainer.removeChild(loadingMsg);
    addMessage(response, 'bot');
  }

  // ==================== ВАШ СУЩЕСТВУЮЩИЙ ФУНКЦИОНАЛ ====================
  // Закрытие модальных окон
  closeBtn.onclick = () => modal.style.display = 'none';
  chatbotClose.onclick = () => chatbotWindow.style.display = 'none';
  
  window.onclick = function(event) {
    if (event.target == modal) modal.style.display = 'none';
    if (event.target == chatbotWindow) chatbotWindow.style.display = 'none';
  };

  // Кнопки загрузки данных
  document.getElementById('load-volunteers').addEventListener('click', loadVolunteers);
  document.getElementById('load-events').addEventListener('click', loadEvents);
  document.getElementById('load-participations').addEventListener('click', loadParticipations);
  
  // Кнопки добавления
  document.getElementById('add-volunteer').addEventListener('click', () => showForm('volunteer'));
  document.getElementById('add-event').addEventListener('click', () => showForm('event'));
  document.getElementById('add-participation').addEventListener('click', () => showForm('participation'));

  // Функции загрузки данных
  async function loadVolunteers() {
    try {
      const response = await fetch('/api/volunteers');
      const volunteers = await response.json();
      
      const volunteersList = document.getElementById('volunteers-list');
      volunteersList.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            ${volunteers.map(v => `
              <tr>
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.email}</td>
                <td>${v.phone || '—'}</td>
                <td>${new Date(v.registration_date).toLocaleDateString()}</td>
                <td>
                  <button onclick="editVolunteer(${v.id})">Редактировать</button>
                  <button onclick="deleteVolunteer(${v.id})">Удалить</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error('Ошибка загрузки волонтеров:', error);
      document.getElementById('volunteers-list').innerHTML = '<p>Ошибка загрузки данных</p>';
    }
  }

  async function loadEvents() {
    try {
      const response = await fetch('/api/events');
      const events = await response.json();
      
      const eventsList = document.getElementById('events-list');
      eventsList.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Дата</th>
              <th>Место</th>
              <th>Участников</th>
              <th>Организатор</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr>
                <td>${e.id}</td>
                <td>${e.title}</td>
                <td>${e.description || '—'}</td>
                <td>${new Date(e.event_date).toLocaleString()}</td>
                <td>${e.location}</td>
                <td>${e.max_participants || '∞'}</td>
                <td>${e.organizer_name}</td>
                <td>
                  <button onclick="editEvent(${e.id})">Редактировать</button>
                  <button onclick="deleteEvent(${e.id})">Удалить</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
      document.getElementById('events-list').innerHTML = '<p>Ошибка загрузки данных</p>';
    }
  }

  async function loadParticipations() {
    try {
      const response = await fetch('/api/participations');
      const participations = await response.json();
      
      const participationsList = document.getElementById('participations-list');
      participationsList.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Волонтер</th>
              <th>Мероприятие</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            ${participations.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.volunteer_name}</td>
                <td>${p.event_title}</td>
                <td>${new Date(p.registration_date).toLocaleDateString()}</td>
                <td>${p.attended ? '✅ Посетил' : '❌ Не посетил'}</td>
                <td>
                  <button onclick="editParticipation(${p.id})">Редактировать</button>
                  <button onclick="deleteParticipation(${p.id})">Удалить</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error('Ошибка загрузки участий:', error);
      document.getElementById('participations-list').innerHTML = '<p>Ошибка загрузки данных</p>';
    }
  }

  // Функции форм
  function showForm(type) {
    let formHtml = '';
    
    if (type === 'volunteer') {
      formHtml = `
        <h3>Добавить волонтера</h3>
        <form id="volunteer-form">
          <div>
            <label for="name">Имя:</label>
            <input type="text" id="name" required>
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" required>
          </div>
          <div>
            <label for="phone">Телефон:</label>
            <input type="tel" id="phone">
          </div>
          <button type="submit">Сохранить</button>
        </form>
      `;
    } else if (type === 'event') {
      formHtml = `
        <h3>Добавить мероприятие</h3>
        <form id="event-form">
          <div>
            <label for="title">Название:</label>
            <input type="text" id="title" required>
          </div>
          <div>
            <label for="description">Описание:</label>
            <textarea id="description"></textarea>
          </div>
          <div>
            <label for="event_date">Дата:</label>
            <input type="datetime-local" id="event_date" required>
          </div>
          <div>
            <label for="location">Место:</label>
            <input type="text" id="location" required>
          </div>
          <div>
            <label for="max_participants">Макс. участников:</label>
            <input type="number" id="max_participants" min="1">
          </div>
          <div>
            <label for="organizer_id">Организатор:</label>
            <select id="organizer_id" required>
              <option value="">Выберите организатора</option>
            </select>
          </div>
          <button type="submit">Сохранить</button>
        </form>
      `;
    } else if (type === 'participation') {
      formHtml = `
        <h3>Добавить участие</h3>
        <form id="participation-form">
          <div>
            <label for="volunteer_id">Волонтер:</label>
            <select id="volunteer_id" required>
              <option value="">Выберите волонтера</option>
            </select>
          </div>
          <div>
            <label for="event_id">Мероприятие:</label>
            <select id="event_id" required>
              <option value="">Выберите мероприятие</option>
            </select>
          </div>
          <div>
            <label for="attended">Посещено:</label>
            <input type="checkbox" id="attended">
          </div>
          <button type="submit">Сохранить</button>
        </form>
      `;
    }
    
    modalForm.innerHTML = formHtml;
    modal.style.display = 'block';
    
    if (type === 'event') {
      loadVolunteersForSelect('organizer_id');
    } else if (type === 'participation') {
      loadVolunteersForSelect('volunteer_id');
      loadEventsForSelect('event_id');
    }
    
    const form = document.getElementById(`${type}-form`);
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(type);
      });
    }
  }

  async function loadVolunteersForSelect(selectId) {
    try {
      const response = await fetch('/api/volunteers');
      const volunteers = await response.json();
      
      const select = document.getElementById(selectId);
      select.innerHTML = '<option value="">Выберите волонтера</option>';
      volunteers.forEach(v => {
        const option = document.createElement('option');
        option.value = v.id;
        option.textContent = v.name;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Ошибка загрузки волонтеров:', error);
    }
  }

  async function loadEventsForSelect(selectId) {
    try {
      const response = await fetch('/api/events');
      const events = await response.json();
      
      const select = document.getElementById(selectId);
      select.innerHTML = '<option value="">Выберите мероприятие</option>';
      events.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = `${e.title} (${new Date(e.event_date).toLocaleDateString()})`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
    }
  }

  async function handleFormSubmit(type) {
    try {
      let url = '';
      let body = {};
      
      if (type === 'volunteer') {
        url = '/api/volunteers';
        body = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value
        };
      } else if (type === 'event') {
        url = '/api/events';
        body = {
          title: document.getElementById('title').value,
          description: document.getElementById('description').value,
          event_date: document.getElementById('event_date').value,
          location: document.getElementById('location').value,
          max_participants: document.getElementById('max_participants').value || null,
          organizer_id: document.getElementById('organizer_id').value
        };
      } else if (type === 'participation') {
        url = '/api/participations';
        body = {
          volunteer_id: document.getElementById('volunteer_id').value,
          event_id: document.getElementById('event_id').value,
          attended: document.getElementById('attended').checked
        };
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        modal.style.display = 'none';
        if (type === 'volunteer') loadVolunteers();
        else if (type === 'event') loadEvents();
        else if (type === 'participation') loadParticipations();
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении данных');
    }
  }

  // Глобальные функции для кнопок в таблицах
  window.editVolunteer = async function(id) {
    try {
      const response = await fetch(`/api/volunteers/${id}`);
      const volunteer = await response.json();
      
      modalForm.innerHTML = `
        <h3>Редактировать волонтера</h3>
        <form id="edit-volunteer-form">
          <input type="hidden" id="edit-id" value="${volunteer.id}">
          <div>
            <label for="edit-name">Имя:</label>
            <input type="text" id="edit-name" value="${volunteer.name}" required>
          </div>
          <div>
            <label for="edit-email">Email:</label>
            <input type="email" id="edit-email" value="${volunteer.email}" required>
          </div>
          <div>
            <label for="edit-phone">Телефон:</label>
            <input type="tel" id="edit-phone" value="${volunteer.phone || ''}">
          </div>
          <button type="submit">Сохранить</button>
        </form>
      `;
      
      modal.style.display = 'block';
      
      document.getElementById('edit-volunteer-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
          const response = await fetch(`/api/volunteers/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: document.getElementById('edit-name').value,
              email: document.getElementById('edit-email').value,
              phone: document.getElementById('edit-phone').value
            })
          });
          
          if (response.ok) {
            modal.style.display = 'none';
            loadVolunteers();
          }
        } catch (error) {
          console.error('Ошибка обновления:', error);
          alert('Ошибка при обновлении данных');
        }
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка при загрузке данных волонтера');
    }
  };
  
  window.deleteVolunteer = async function(id) {
    if (confirm('Вы уверены, что хотите удалить этого волонтера?')) {
      try {
        const response = await fetch(`/api/volunteers/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadVolunteers();
        }
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении волонтера');
      }
    }
  };

  window.editEvent = async function(id) {
    try {
      const response = await fetch(`/api/events/${id}`);
      const event = await response.json();
      
      modalForm.innerHTML = `
        <h3>Редактировать мероприятие</h3>
        <form id="edit-event-form">
          <input type="hidden" id="edit-id" value="${event.id}">
          <div>
            <label for="edit-title">Название:</label>
            <input type="text" id="edit-title" value="${event.title}" required>
          </div>
          <div>
            <label for="edit-description">Описание:</label>
            <textarea id="edit-description">${event.description || ''}</textarea>
          </div>
          <div>
            <label for="edit-event_date">Дата:</label>
            <input type="datetime-local" id="edit-event_date" 
                   value="${new Date(event.event_date).toISOString().slice(0, 16)}" required>
          </div>
          <div>
            <label for="edit-location">Место:</label>
            <input type="text" id="edit-location" value="${event.location}" required>
          </div>
          <div>
            <label for="edit-max_participants">Макс. участников:</label>
            <input type="number" id="edit-max_participants" 
                   value="${event.max_participants || ''}" min="1">
          </div>
          <div>
            <label for="edit-organizer_id">Организатор:</label>
            <select id="edit-organizer_id" required>
              <option value="">Выберите организатора</option>
            </select>
          </div>
          <button type="submit">Сохранить</button>
        </form>
      `;
      
      await loadVolunteersForSelect('edit-organizer_id');
      document.getElementById('edit-organizer_id').value = event.organizer_id;
      
      modal.style.display = 'block';
      
      document.getElementById('edit-event-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
          const response = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: document.getElementById('edit-title').value,
              description: document.getElementById('edit-description').value,
              event_date: document.getElementById('edit-event_date').value,
              location: document.getElementById('edit-location').value,
              max_participants: document.getElementById('edit-max_participants').value || null,
              organizer_id: document.getElementById('edit-organizer_id').value
            })
          });
          
          if (response.ok) {
            modal.style.display = 'none';
            loadEvents();
          }
        } catch (error) {
          console.error('Ошибка обновления:', error);
          alert('Ошибка при обновлении мероприятия');
        }
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка при загрузке данных мероприятия');
    }
  };
  
  window.deleteEvent = async function(id) {
    if (confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadEvents();
        }
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении мероприятия');
      }
    }
  };

  window.editParticipation = async function(id) {
    try {
      const response = await fetch(`/api/participations/${id}`);
      const participation = await response.json();
      
      modalForm.innerHTML = `
        <h3>Редактировать участие</h3>
        <form id="edit-participation-form">
          <input type="hidden" id="edit-id" value="${participation.id}">
          <div>
            <label for="edit-volunteer_id">Волонтер:</label>
            <select id="edit-volunteer_id" required>
              <option value="">Выберите волонтера</option>
            </select>
          </div>
          <div>
            <label for="edit-event_id">Мероприятие:</label>
            <select id="edit-event_id" required>
              <option value="">Выберите мероприятие</option>
            </select>
          </div>
          <div>
            <label for="edit-attended">Посещено:</label>
            <input type="checkbox" id="edit-attended" ${participation.attended ? 'checked' : ''}>
          </div>
          <button type="submit">Сохранить</button>
        </form>
      `;
      
      await loadVolunteersForSelect('edit-volunteer_id');
      await loadEventsForSelect('edit-event_id');
      
      document.getElementById('edit-volunteer_id').value = participation.volunteer_id;
      document.getElementById('edit-event_id').value = participation.event_id;
      
      modal.style.display = 'block';
      
      document.getElementById('edit-participation-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
          const response = await fetch(`/api/participations/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              attended: document.getElementById('edit-attended').checked
            })
          });
          
          if (response.ok) {
            modal.style.display = 'none';
            loadParticipations();
          }
        } catch (error) {
          console.error('Ошибка обновления:', error);
          alert('Ошибка при обновлении участия');
        }
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка при загрузке данных участия');
    }
  };
  
  window.deleteParticipation = async function(id) {
    if (confirm('Вы уверены, что хотите удалить это участие?')) {
      try {
        const response = await fetch(`/api/participations/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadParticipations();
        }
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении участия');
      }
    }
  };

  // ==================== ИНИЦИАЛИЗАЦИЯ ЧАТ-БОТА ====================
  chatbotButton.addEventListener('click', function() {
    chatbotWindow.style.display = 'flex';
    userInput.focus();
  });

  chatbotSend.addEventListener('click', handleChatMessage);
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleChatMessage();
  });

  // Приветственное сообщение
  let firstOpen = true;
  chatbotButton.addEventListener('click', function() {
    if (firstOpen) {
      setTimeout(() => {
        addMessage("Это помощник сайта Волонтеры.ру. Готов вас выслушать и дать ответ на любой вопрос.", 'bot');
      }, 500);
      firstOpen = false;
    }
  });
  
  
  
});
