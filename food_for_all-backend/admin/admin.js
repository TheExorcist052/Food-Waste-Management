document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in (in a real app, you'd have proper session management)
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load all data
    loadDashboardData();
    
    // Navigation smooth scrolling
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Logout button
    document.querySelector('button.bg-red-500').addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    });
});

function loadDashboardData() {
    fetch('backend.php?action=admin_get_all_data')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update stats
                document.getElementById('donations-count').textContent = 
                    data.donations.filter(d => d.status === 'available').length;
                document.getElementById('discounts-count').textContent = 
                    data.discounted_foods.filter(f => f.status === 'available').length;
                document.getElementById('reviews-count').textContent = data.reviews.length;
                document.getElementById('orders-count').textContent = data.orders.length;

                // Populate donations table
                const donationsTable = document.getElementById('donations-table');
                donationsTable.innerHTML = data.donations.map(donation => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">${donation.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${donation.donor_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${donation.food_type}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${donation.location}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${new Date(donation.expiry_date).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs rounded-full 
                                ${donation.status === 'available' ? 'bg-green-100 text-green-800' : 
                                  donation.status === 'claimed' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'}">
                                ${donation.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <select class="status-select border rounded p-1" 
                                    data-type="donation" 
                                    data-id="${donation.id}">
                                <option value="available" ${donation.status === 'available' ? 'selected' : ''}>Available</option>
                                <option value="claimed" ${donation.status === 'claimed' ? 'selected' : ''}>Claimed</option>
                                <option value="expired" ${donation.status === 'expired' ? 'selected' : ''}>Expired</option>
                            </select>
                        </td>
                    </tr>
                `).join('');

                // Populate discounts table
                const discountsTable = document.getElementById('discounts-table');
                discountsTable.innerHTML = data.discounted_foods.map(food => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">${food.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${food.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">৳${food.original_price}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${food.discount_percentage}%</td>
                        <td class="px-6 py-4 whitespace-nowrap">${food.location}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs rounded-full 
                                ${food.status === 'available' ? 'bg-green-100 text-green-800' : 
                                  food.status === 'sold_out' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'}">
                                ${food.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <select class="status-select border rounded p-1" 
                                    data-type="discount" 
                                    data-id="${food.id}">
                                <option value="available" ${food.status === 'available' ? 'selected' : ''}>Available</option>
                                <option value="sold_out" ${food.status === 'sold_out' ? 'selected' : ''}>Sold Out</option>
                                <option value="expired" ${food.status === 'expired' ? 'selected' : ''}>Expired</option>
                            </select>
                        </td>
                    </tr>
                `).join('');

                // Populate reviews
                const reviewsContainer = document.getElementById('reviews-container');
                reviewsContainer.innerHTML = data.reviews.map(review => `
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <div class="text-yellow-400">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            </div>
                            <span class="ml-2 text-sm text-gray-500">
                                ${new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h4 class="font-bold mb-2">${review.username}</h4>
                        <p class="text-gray-600">${review.comment || 'No comment provided'}</p>
                    </div>
                `).join('');

                // Add event listeners for status changes
                document.querySelectorAll('.status-select').forEach(select => {
                    select.addEventListener('change', function() {
                        const foodType = this.dataset.type;
                        const foodId = this.dataset.id;
                        const newStatus = this.value;
                        
                        updateFoodStatus(foodType, foodId, newStatus);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
        });
}

function updateFoodStatus(foodType, foodId, status) {
    const formData = new FormData();
    formData.append('action', 'update_food_status');
    formData.append('food_type', foodType);
    formData.append('food_id', foodId);
    formData.append('status', status);

    fetch('backend.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Status updated successfully');
            loadDashboardData(); // Refresh data
        } else {
            alert('Failed to update status: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating food status:', error);
        alert('An error occurred while updating status');
    });
}