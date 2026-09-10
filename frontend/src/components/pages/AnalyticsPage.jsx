import { useEffect, useState } from "react";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { getTickets } from "../../services/ticketService";
import { addCategory, getCategories, updateCategory } from "../../services/categoryService";
import usePageTitle from "../../hooks/usePageTitle";

export default function AnalyticsPage() {
  usePageTitle("Analytics Page");
  const [metric, setMetric] = useState("volume");
  const [date, setDate] = useState("Last 30 Days");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTickets(), getCategories()])
      .then(([ticketsResponse, categoriesResponse]) => {
        const ticketData = Array.isArray(ticketsResponse.data)
          ? ticketsResponse.data
          : ticketsResponse.data?.content || [];
        const categoryData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        setTickets(ticketData);
        setCategories(categoryData);
      })
      .catch(() => setError("Unable to load analytics data."))
      .finally(() => setCategoryLoading(false));
  }, []);

  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN");
  const priorityTickets = tickets.filter(
    (ticket) =>
      ticket.status !== "RESOLVED" &&
      (ticket.priority === "HIGH" || ticket.priority === "CRITICAL"),
  );
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  );
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED");
  const ticketCountByName = tickets.reduce((counts, ticket) => {
    const name = ticket.categoryName || "Uncategorized";
    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});
  const categoryRows = Array.from(
    new Map(categories.map((category) => [category.name, category])).values(),
  );
  const categoryCounts = Object.entries({
    ...Object.fromEntries(categoryRows.map((category) => [category.name, 0])),
    ...ticketCountByName,
  });
  const visibleCategories = categoryRows.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );
  const agentCounts = Object.entries(
    tickets.reduce((counts, ticket) => {
      if (ticket.assignedAgentName) {
        counts[ticket.assignedAgentName] = (counts[ticket.assignedAgentName] || 0) + 1;
      }
      return counts;
    }, {}),
  );
  const openNewCategoryForm = () => {
    setEditingCategory(null);
    setNewCategory("");
    setCategoryDescription("");
    setCategoryError("");
    setShowCategoryForm(true);
  };

  const openEditCategoryForm = (category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
    setCategoryDescription(category.description || "");
    setCategoryError("");
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setNewCategory("");
    setCategoryDescription("");
    setCategoryError("");
  };

  const closeCategoryForm = () => {
    if (categoryLoading) return;
    resetCategoryForm();
  };

  return (
    <Shell>
      <PageHeader
        eyebrow="ITSM OPERATIONAL INTELLIGENCE  •  LIVE TELEMETRY"
        title="IT Operations & Analytics"
        description="Real-time performance tracking, ticket volume trends, agent allocation, and service category management."
        action={
          <select
            value={date}
            onChange={(event) => setDate(event.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
        }
      />
      {error && <p className="form-error">{error}</p>}
      <div className="stats-grid analytics-stats">
        {[
          ["Open Tickets", openTickets.length, "Current records"],
          ["High / Critical Priority", priorityTickets.length, "Current records"],
          ["In Progress", inProgressTickets.length, "Current records"],
          ["Resolved (Period)", resolvedTickets.length, "Current records"],
        ].map(([label, value, note]) => (
          <section className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </section>
        ))}
      </div>
      <div className="content-grid analytics-grid">
        <section className="panel chart">
          <div className="panel-heading">
            <h2>Tickets by Category</h2>
            <div className="tabs">
              <button
                className={metric === "volume" ? "selected" : ""}
                onClick={() => setMetric("volume")}
              >
                Volume
              </button>
              <button
                className={metric === "sla" ? "selected" : ""}
                onClick={() => setMetric("sla")}
              >
                SLA Breach %
              </button>
            </div>
          </div>
          {categoryCounts.map(([name, value]) => (
            <div className="bar-row" key={name}>
              <span>
                {name}
                <b>
                  {metric === "volume"
                    ? `${value} tickets`
                    : "Unavailable"}
                </b>
              </span>
              <i>
                <em
                  style={{
                    width: `${metric === "volume" ? Math.min(value * 10, 100) : 0}%`,
                  }}
                />
              </i>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Agent Workload & Allocation</h2>
          {agentCounts.map(([name, value]) => (
            <div className="bar-row" key={name}>
              <span>
                {name}
                <b>{value} tickets</b>
              </span>
              <i>
                <em style={{ width: `${Math.min(value * 20, 100)}%` }} />
              </i>
            </div>
          ))}
        </section>
      </div>
      <section className="panel">
          <div className="panel-heading">
          <div>
            <h2>Manage Ticket Categories</h2>
            <p>
              Configure the taxonomy used for routing, reporting, and ticket intake.
            </p>
          </div>
            <button className="primary-button" onClick={openNewCategoryForm}>+ Add Service Category</button>
          </div>
          <div className="category-toolbar">
            <div>
              <strong>{categoryRows.length}</strong>
              <span>configured categories</span>
            </div>
            <input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Filter categories..." aria-label="Filter categories" />
        </div>
          {categoryLoading && <p>Loading service categories...</p>}
          {!categoryLoading && visibleCategories.map((category) => (
            <div
              className="category-row"
              key={category.id || category.name}
              onClick={() => openEditCategoryForm(category)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openEditCategoryForm(category);
                }
              }}
            >
              <div><strong>{category.name}</strong><small>{category.description || "No description provided"}</small></div>
              <span><b>{ticketCountByName[category.name] || 0}</b> active tickets</span>
              <span className="category-routing">General Service Desk</span>
              <span className="category-status">Active</span>
            </div>
          ))}
          {!categoryLoading && !visibleCategories.length && <p>No categories match this filter.</p>}
      </section>
      {showCategoryForm && (
        <div className="modal-backdrop" role="presentation" onClick={closeCategoryForm}>
          <form
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              const name = newCategory.trim();
              const description = categoryDescription.trim();
              if (!name || !description) return;

              setCategoryLoading(true);
              const saveCategory = editingCategory
                ? updateCategory(editingCategory.id, name, description)
                : addCategory(name, description);

              saveCategory
                .then((response) => {
                  const savedCategory = response.data || {
                    ...editingCategory,
                    name,
                    description,
                  };
                  setCategories((current) => editingCategory
                    ? current.map((category) => category.id === editingCategory.id ? savedCategory : category)
                    : [...current, savedCategory]);
                  resetCategoryForm();
                })
                .catch(() => setCategoryError(`Unable to ${editingCategory ? "update" : "save"} category.`))
                .finally(() => setCategoryLoading(false));
            }}
          >
            <div className="panel-heading">
              <div><span className="eyebrow">TAXONOMY MANAGEMENT</span><h2>{editingCategory ? "Edit Service Category" : "New Service Category"}</h2></div>
              <button type="button" className="icon-button" aria-label="Close category form" onClick={closeCategoryForm}><span>×</span></button>
            </div>
            <p className="modal-lead">Add a clear category description so teams can route requests consistently.</p>
            <label>
              Category Name:
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Cloud Infrastructure & DevOps" required autoFocus />
            </label><br></br>
            <label>
              Category Description:
              <textarea value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Describe the requests this category should receive." rows="4" required />
            </label>
            {categoryError && <p className="form-error">{categoryError}</p>}
            <div className="form-actions">
              <button type="button" className="secondary-button" disabled={categoryLoading} onClick={closeCategoryForm}>Cancel</button>
              <button type="submit" className="primary-button" disabled={categoryLoading}>{categoryLoading ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}</button>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}
