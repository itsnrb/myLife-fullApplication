export async function deleteData(id) {
  const response = await fetch(`http://localhost:3000/delete/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function deleteTopic(id) {
  const response = await fetch(`http://localhost:3000/deleteTopic/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function saveToDB(id, data) {
  const response = await fetch(`http://localhost:3000/history/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function loadData() {
  const response = await fetch("http://localhost:3000/data");
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  if (Array.isArray(data) && data.length > 0) {
    return data
  } else {
    return []
  }
}

export async function saveNewTopic(data) {
  const response = await fetch("http://localhost:3000/topic", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function loadTopics() {
  const response = await fetch("http://localhost:3000/topics");
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  if (Array.isArray(data) && data.length > 0) {
    return data
  } else {
    return []
  }
}