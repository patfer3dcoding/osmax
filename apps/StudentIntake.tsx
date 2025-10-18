import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

interface Student {
    id: string;
    nombre: string;
    apellidos: string;
    direccion: string;
    telefono: string;
    email: string;
    referencia: string;
    tutorLegal: string;
    alergias: string;
    covid: boolean;
    curp: string;
    fechaNacimiento: string;
    curso: string;
    ubicacion: string;
    fechaRegistro: string;
}

const CURSOS = [
    'Microblading',
    'Extensiones de Pestañas',
    'Lifting de Pestañas',
    'Henna',
];

const UBICACIONES = ['Polanco', 'Perisur', 'Ciudad Brisas'];

const emptyStudent: Student = {
    id: '',
    nombre: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    email: '',
    referencia: '',
    tutorLegal: '',
    alergias: '',
    covid: false,
    curp: '',
    fechaNacimiento: '',
    curso: CURSOS[0],
    ubicacion: UBICACIONES[0],
    fechaRegistro: new Date().toISOString().split('T')[0]
};

export const StudentIntakeApp: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const savedStudents = localStorage.getItem('maxfra-students');
        if (savedStudents) {
            setStudents(JSON.parse(savedStudents));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('maxfra-students', JSON.stringify(students));
    }, [students]);

    const handleAddNew = () => {
        setCurrentStudent({ ...emptyStudent, id: Date.now().toString() });
        setMode('add');
    };

    const handleEdit = (student: Student) => {
        setCurrentStudent(student);
        setMode('edit');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Está seguro que desea eliminar este estudiante?')) {
            setStudents(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStudent) return;

        if (mode === 'add') {
            setStudents(prev => [...prev, currentStudent]);
        } else {
            setStudents(prev => prev.map(s => s.id === currentStudent.id ? currentStudent : s));
        }
        setMode('list');
        setCurrentStudent(null);
    };

    const generatePDF = (student: Student) => {
        const doc = new jsPDF();
        const lineHeight = 10;
        let y = 20;

        // Title
        doc.setFontSize(20);
        doc.text('MAXFRA ACADEMY - Registro de Estudiante', 105, y, { align: 'center' });
        y += lineHeight * 2;

        // Content
        doc.setFontSize(12);
        const addLine = (label: string, value: string) => {
            doc.text(\`\${label}: \${value}\`, 20, y);
            y += lineHeight;
        };

        addLine('Nombre Completo', \`\${student.nombre} \${student.apellidos}\`);
        addLine('Fecha de Registro', new Date(student.fechaRegistro).toLocaleDateString());
        addLine('Dirección', student.direccion);
        addLine('Teléfono', student.telefono);
        addLine('Email', student.email);
        addLine('Referencia', student.referencia);
        addLine('Tutor Legal', student.tutorLegal);
        addLine('Alergias', student.alergias || 'Ninguna');
        addLine('COVID-19', student.covid ? 'Sí' : 'No');
        addLine('CURP', student.curp);
        addLine('Fecha de Nacimiento', new Date(student.fechaNacimiento).toLocaleDateString());
        addLine('Curso', student.curso);
        addLine('Ubicación', student.ubicacion);

        // Footer
        doc.setFontSize(10);
        doc.text('Este documento es un registro oficial de MAXFRA ACADEMY', 105, 280, { align: 'center' });

        // Save the PDF
        doc.save(\`registro-\${student.nombre}-\${student.apellidos}.pdf\`);
    };

    const filteredStudents = students.filter(student => 
        \`\${student.nombre} \${student.apellidos}\`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.curp.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (mode === 'list') {
        return (
            <div className="w-full h-full flex flex-col bg-gray-100 p-4 text-black overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Registro de Estudiantes</h1>
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        + Nuevo Estudiante
                    </button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o CURP..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex-grow overflow-auto">
                    <table className="w-full bg-white shadow-md rounded">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 text-left">Nombre</th>
                                <th className="p-2 text-left">Curso</th>
                                <th className="p-2 text-left">Ubicación</th>
                                <th className="p-2 text-left">Teléfono</th>
                                <th className="p-2 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2">{student.nombre} {student.apellidos}</td>
                                    <td className="p-2">{student.curso}</td>
                                    <td className="p-2">{student.ubicacion}</td>
                                    <td className="p-2">{student.telefono}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => generatePDF(student)}
                                                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                                            >
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-100 p-4 overflow-auto text-black">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6">
                    {mode === 'add' ? 'Nuevo Estudiante' : 'Editar Estudiante'}
                </h2>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre(s)</label>
                            <input
                                type="text"
                                value={currentStudent?.nombre}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, nombre: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Apellidos</label>
                            <input
                                type="text"
                                value={currentStudent?.apellidos}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, apellidos: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Dirección</label>
                        <input
                            type="text"
                            value={currentStudent?.direccion}
                            onChange={e => setCurrentStudent(prev => prev ? {...prev, direccion: e.target.value} : prev)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                            <input
                                type="tel"
                                value={currentStudent?.telefono}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, telefono: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={currentStudent?.email}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, email: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Referencia</label>
                        <input
                            type="text"
                            value={currentStudent?.referencia}
                            onChange={e => setCurrentStudent(prev => prev ? {...prev, referencia: e.target.value} : prev)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tutor Legal</label>
                        <input
                            type="text"
                            value={currentStudent?.tutorLegal}
                            onChange={e => setCurrentStudent(prev => prev ? {...prev, tutorLegal: e.target.value} : prev)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Alergias</label>
                        <textarea
                            value={currentStudent?.alergias}
                            onChange={e => setCurrentStudent(prev => prev ? {...prev, alergias: e.target.value} : prev)}
                            className="w-full p-2 border rounded"
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={currentStudent?.covid}
                            onChange={e => setCurrentStudent(prev => prev ? {...prev, covid: e.target.checked} : prev)}
                            id="covid"
                        />
                        <label htmlFor="covid" className="text-sm font-medium">¿Ha tenido COVID-19?</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">CURP</label>
                            <input
                                type="text"
                                value={currentStudent?.curp}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, curp: e.target.value.toUpperCase()} : prev)}
                                className="w-full p-2 border rounded"
                                required
                                maxLength={18}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={currentStudent?.fechaNacimiento}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, fechaNacimiento: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Curso</label>
                            <select
                                value={currentStudent?.curso}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, curso: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            >
                                {CURSOS.map(curso => (
                                    <option key={curso} value={curso}>{curso}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ubicación</label>
                            <select
                                value={currentStudent?.ubicacion}
                                onChange={e => setCurrentStudent(prev => prev ? {...prev, ubicacion: e.target.value} : prev)}
                                className="w-full p-2 border rounded"
                                required
                            >
                                {UBICACIONES.map(ubicacion => (
                                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('list');
                                setCurrentStudent(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {mode === 'add' ? 'Registrar' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};