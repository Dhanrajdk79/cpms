
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const emptyForm = {
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
};

function Clients() {
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadClients = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/clients');
            const result = response.data.clients ||
                response.data.data ||
                response.data;

            setClients(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load clients.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const filteredClients = useMemo(() => {
        const term = search.toLowerCase().trim();

        if (!term) return clients;

        return clients.filter((client) =>
            [
                client.company_name,
                client.contact_person,
                client.email,
                client.phone
            ].some((value) =>
                String(value || '').toLowerCase().includes(term)
            )
        );
    }, [clients, search]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const openEditForm = (client) => {
        setEditingId(client.id);
        setForm({
            company_name: client.company_name || '',
            contact_person: client.contact_person || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || ''
        });
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (editingId) {
                await api.put(`/clients/${editingId}`, form);
                setSuccess('Client updated successfully.');
            } else {
                await api.post('/clients', form);
                setSuccess('Client created successfully.');
            }

            closeForm();
            await loadClients();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to save client. Please check the details.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (client) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${client.company_name}?`
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            await api.delete(`/clients/${client.id}`);
            setSuccess('Client deleted successfully.');
            await loadClients();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete client.'
            );
        }
    };

    return (
        <div className="clients-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">MANAGEMENT</p>
                    <h1>Clients</h1>
                    <p>Manage your client companies and contact details.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    + Add Client
                </button>
            </div>

            <div className="client-toolbar">
                <div>
                    <h2>All Clients</h2>
                    <p>{clients.length} client records</p>
                </div>

                <input
                    className="search-input"
                    type="search"
                    placeholder="Search company, contact or email..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="client-form-card">
                    <div className="section-heading">
                        <div>
                            <h2>{editingId ? 'Edit Client' : 'Add New Client'}</h2>
                            <p>Enter the client information below.</p>
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={closeForm}
                        >
                            Close
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="client-form">
                        <div className="form-field">
                            <label htmlFor="company_name">Company Name *</label>
                            <input
                                id="company_name"
                                name="company_name"
                                value={form.company_name}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                placeholder="Enter company name"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="contact_person">Contact Person *</label>
                            <input
                                id="contact_person"
                                name="contact_person"
                                value={form.contact_person}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                placeholder="Enter contact person"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="company@example.com"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                maxLength={20}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="address">Address *</label>
                            <textarea
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                required
                                rows={3}
                                maxLength={500}
                                placeholder="Enter client address"
                            />
                        </div>

                        <div className="form-actions full-width">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingId
                                        ? 'Update Client'
                                        : 'Save Client'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="client-table-card">
                {loading ? (
                    <div className="loading">Loading clients...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="empty-state">
                        {search
                            ? 'No clients match your search.'
                            : 'No clients found. Add your first client.'}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Contact Person</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <strong>{client.company_name}</strong>
                                        </td>
                                        <td>{client.contact_person}</td>
                                        <td>{client.email}</td>
                                        <td>{client.phone}</td>
                                        <td>{client.address}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => openEditForm(client)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(client)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Clients;
