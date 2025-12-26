import React from 'react';

const FilterButtons = ({ categories, activeFilter, onFilterChange }) => {
    return (
        <div className="products-filters">
            {categories.map((category) => (
                <button
                    key={category}
                    className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                    onClick={() => onFilterChange(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default FilterButtons;
