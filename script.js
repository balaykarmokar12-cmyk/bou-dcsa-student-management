const STORAGE_KEY = 'bou_students_final_v3';
const OLD_STORAGE_KEY = 'bou_students_final_v2';

function loadStudents() {
    try {
        let data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        }
        let oldData = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldData) {
            const oldParsed = JSON.parse(oldData);
            if (Array.isArray(oldParsed) && oldParsed.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(oldParsed));
                return oldParsed;
            }
        }
    } catch (e) {
        console.warn("LocalStorage JSON Error, resetting data:", e);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(OLD_STORAGE_KEY);
    }
    return [
        {name:"Balay Karmaker",roll:"2415082008",program:"DCSA",semester:"6th",phone:"01700000000",email:"balay@gmail.com",admissionDate:"2024-01-15",status:"Active",gpa:"3.85",remarks:"1st Division - Pass",address:"DIIT, Chittagong"},
        {name:"Demo Student",roll:"2415082009",program:"DCSA",semester:"5th",phone:"01800000000",email:"demo@gmail.com",admissionDate:"2024-02-01",status:"Active",gpa:"3.60",remarks:"Pass",address:"Chittagong"}
    ];
}

let students = loadStudents();

function escapeHtml(str){ 
    const div = document.createElement('div'); 
    div.textContent = str || ''; 
    return div.innerHTML; 
}

function save(){ 
    try { 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); 
    } catch(e) { 
        console.error("Storage Error:", e);
        alert("⚠️ Storage Full or Blocked! Please export your data and clear storage."); 
    } 
}

function switchTab(id, el){
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active-section'));
    document.getElementById(id).classList.add('active-section');
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    const target = el || document.querySelector(`.menu li[data-tab="${id}"]`);
    if(target) target.classList.add('active');
    if(window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
    renderTable();
}

document.querySelectorAll('.menu li').forEach(li => { 
    li.addEventListener('click', () => switchTab(li.dataset.tab, li)); 
});

document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

function updateTime(){ 
    const el = document.getElementById('dateTime'); 
    if(el) el.textContent = new Date().toLocaleString('en-BD'); 
}
setInterval(updateTime, 1000); 
updateTime();

function validate(){
    let ok = true;
    const name = document.getElementById('name').value.trim();
    const roll = document.getElementById('roll').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    document.getElementById('nameError').textContent = name.length < 3 ? "Name minimum 3 chars" : "";
    document.getElementById('rollError').textContent = roll.length < 4 ? "ID minimum 4 chars" : "";
    document.getElementById('phoneError').textContent = phone && !/^[0-9]{11}$/.test(phone) ? "11 digit phone" : "";
    document.getElementById('emailError').textContent = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Invalid email" : "";
    
    if(name.length < 3 || roll.length < 4) ok = false;
    if(phone && !/^[0-9]{11}$/.test(phone)) ok = false;
    if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;
    return ok;
}

document.getElementById('studentForm').addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate()){ alert("Please fix validation errors"); return; }
    
    const student = {
        name: document.getElementById('name').value.trim(),
        roll: document.getElementById('roll').value.trim(),
        program: document.getElementById('program').value,
        semester: document.getElementById('semester').value,
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        admissionDate: document.getElementById('admissionDate').value,
        status: document.getElementById('status').value,
        gpa: document.getElementById('gpa').value.trim() || "N/A",
        remarks: document.getElementById('remarks').value.trim() || "N/A",
        address: document.getElementById('address').value.trim() || "N/A"
    };
    
    const editIndexVal = document.getElementById('editIndex').value;
    
    if(editIndexVal === ''){
        // Adding New Student
        if(students.some(s => s.roll.toLowerCase() === student.roll.toLowerCase())){
            document.getElementById('rollError').textContent = "This ID already exists!";
            alert("Duplicate ID!");
            return;
        }
        students.push(student);
    } else {
        // Editing Existing Student with Index Validation
        const idx = parseInt(editIndexVal, 10);
        if(isNaN(idx) || idx < 0 || idx >= students.length){
            alert("Invalid Edit Index! Please reset form.");
            return;
        }
        const isDuplicate = students.some((s, i) => i !== idx && s.roll.toLowerCase() === student.roll.toLowerCase());
        if(isDuplicate){
            document.getElementById('rollError').textContent = "This ID belongs to another student!";
            alert("Duplicate ID! Another student has this ID.");
            return;
        }
        students[idx] = student;
        document.getElementById('editIndex').value = '';
        document.getElementById('formTitle').textContent = 'Add New Student';
    }
    
    save(); 
    alert('✅ Saved Successfully!'); 
    clearForm(); 
    renderTable(); 
    switchTab('viewStudents');
});

function renderTable(){
    const tbody = document.querySelector('#studentTable tbody');
    const recentTbody = document.querySelector('#recentTable tbody');
    if(!tbody) return;
    tbody.innerHTML = ''; 
    if(recentTbody) recentTbody.innerHTML = '';
    
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('activeStudents').textContent = students.filter(s => s.status === 'Active').length;
    document.getElementById('lastId').textContent = students.length ? students[students.length - 1].roll : "-";
    
    students.forEach((s, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><b>${escapeHtml(s.roll)}</b></td>
                        <td>${escapeHtml(s.name)}</td>
                        <td>${escapeHtml(s.semester)}</td>
                        <td>${escapeHtml(s.phone)}</td>
                        <td><span class="badge active-badge">${escapeHtml(s.gpa)} - ${escapeHtml(s.remarks)}</span></td>
                        <td><span class="badge ${s.status === 'Active' ? 'active-badge' : 'inactive-badge'}">${escapeHtml(s.status)}</span></td>
                        <td>
                            <button class="action-btn view" data-id="${escapeHtml(s.roll)}"><i class="fas fa-eye"></i></button>
                            <button class="action-btn edit" data-edit="${i}"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" data-del="${i}"><i class="fas fa-trash"></i></button>
                        </td>`; // Properly closed </tr>
        tbody.appendChild(tr);
    });
    
    [...students].slice(-5).reverse().forEach(s => {
        if(recentTbody){ 
            const tr = document.createElement('tr'); 
            tr.innerHTML = `<td>${escapeHtml(s.roll)}</td>
                            <td>${escapeHtml(s.name)}</td>
                            <td>${escapeHtml(s.semester)}</td>
                            <td>${escapeHtml(s.gpa)}</td>`; 
            recentTbody.appendChild(tr); 
        }
    });
    
    tbody.querySelectorAll('[data-id]').forEach(btn => btn.addEventListener('click', () => viewById(btn.dataset.id)));
    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => editStudent(parseInt(btn.dataset.edit, 10))));
    tbody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => deleteStudent(parseInt(btn.dataset.del, 10))));
}

function editStudent(i){ 
    if(isNaN(i) || i < 0 || i >= students.length) return;
    const s = students[i]; 
    document.getElementById('name').value = s.name; 
    document.getElementById('roll').value = s.roll; 
    document.getElementById('program').value = s.program; 
    document.getElementById('semester').value = s.semester; 
    document.getElementById('phone').value = s.phone; 
    document.getElementById('email').value = s.email; 
    document.getElementById('admissionDate').value = s.admissionDate; 
    document.getElementById('status').value = s.status; 
    document.getElementById('gpa').value = s.gpa; 
    document.getElementById('remarks').value = s.remarks; 
    document.getElementById('address').value = s.address; 
    document.getElementById('editIndex').value = i; 
    document.getElementById('formTitle').textContent = 'Edit Student - ' + s.roll; 
    switchTab('addStudent'); 
}

function deleteStudent(i){ 
    if(isNaN(i) || i < 0 || i >= students.length) return;
    if(confirm('Delete ' + students[i].name + '?')){ 
        students.splice(i, 1); 
        save(); 
        renderTable(); 
    } 
}

function clearForm(){ 
    document.getElementById('studentForm').reset(); 
    document.getElementById('editIndex').value = ''; 
    document.querySelectorAll('.error-msg').forEach(e => e.textContent = ''); 
    document.getElementById('formTitle').textContent = 'Add New Student'; 
}

document.getElementById('searchInput').addEventListener('input', function(){ 
    const q = this.value.toLowerCase(); 
    document.querySelectorAll('#studentTable tbody tr').forEach(row => { 
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'; 
    }); 
});

function searchById(){
    const id = document.getElementById('idSearchInput').value.trim();
    if(!id){ alert("Enter Student ID"); return; }
    const found = students.find(s => s.roll.toLowerCase() === id.toLowerCase());
    const resultDiv = document.getElementById('idSearchResult'); 
    resultDiv.style.display = 'block';
    
    if(found){
        resultDiv.innerHTML = `<div class="result-header">
                                    <h3><i class="fas fa-user-graduate"></i> ${escapeHtml(found.name)}</h3>
                                    <span class="badge active-badge">${escapeHtml(found.status)}</span>
                               </div>
                               <div class="info-grid">
                                    <div><b>ID:</b> ${escapeHtml(found.roll)}</div>
                                    <div><b>Program:</b> ${escapeHtml(found.program)}</div>
                                    <div><b>Semester:</b> ${escapeHtml(found.semester)}</div>
                                    <div><b>Phone:</b> ${escapeHtml(found.phone)}</div>
                                    <div><b>Email:</b> ${escapeHtml(found.email)}</div>
                                    <div><b>Admission:</b> ${escapeHtml(found.admissionDate)}</div>
                                    <div><b>GPA/Result:</b> <span style="color:green;font-weight:700">${escapeHtml(found.gpa)}</span></div>
                                    <div><b>Remarks/Break:</b> ${escapeHtml(found.remarks)}</div>
                                    <div style="grid-column:1/-1"><b>Address:</b> ${escapeHtml(found.address)}</div>
                                    <div style="grid-column:1/-1;background:#f0f9ff;border:1px solid #bae6fd"><b>System Record:</b> Information retrieved from database. Current Status: ${escapeHtml(found.remarks)}</div>
                               </div>`;
    } else { 
        resultDiv.innerHTML = `<p style="color:#dc2626;text-align:center;padding:18px">No Student Found with ID: <b>${escapeHtml(id)}</b></p>`; 
    }
}

document.getElementById('searchBtn').addEventListener('click', searchById);
document.getElementById('idSearchInput').addEventListener('keypress', e => { if(e.key === 'Enter') searchById(); });

function viewById(id){ 
    document.getElementById('idSearchInput').value = id; 
    switchTab('idSearch'); 
    searchById(); 
}

function exportJSON(){ 
    try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
        const a = document.createElement('a'); 
        a.href = dataStr; 
        a.download = `BOU_DCSA_Students_${Date.now()}.json`; 
        a.click(); 
    } catch(e) {
        alert("Export failed!");
    }
}

function csvEscape(field){
    field = field == null ? '' : String(field);
    if(field.includes('"') || field.includes(',') || field.includes('\n') || field.includes('\r')){
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
}

function exportCSV(){
    try {
        let csv = "ID,Name,Program,Semester,Phone,Email,GPA,Remarks,Status,Address,Admission\n";
        students.forEach(s => {
            const row = [s.roll, s.name, s.program, s.semester, s.phone, s.email, s.gpa, s.remarks, s.status, s.address, s.admissionDate].map(csvEscape).join(",");
            csv += row + "\n";
        });
        const a = document.createElement('a');
        a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        a.download = `BOU_DCSA_Students_${Date.now()}.csv`;
        a.click();
    } catch(e) {
        alert("Export failed!");
    }
}

renderTable(); 
save();
