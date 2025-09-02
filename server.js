const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(express.json());

const fetchData = async (valu = {}) => {
  try {
    const result = await fetch('https://jsonplaceholder.typicode.com/comments');
    const res = await result.json();
    return res;
  } catch (err) {
    console.log('Something went wrong:', err);
    return [];
  }
}

const fetchData2 = async (value = {}) => {
  const {
    offset = 0,
    limit = 10,
    queryField = 'all',
    queryString = ''
  } = value;

  console.log('value tva:', value);

  try {
    const result = await fetch('https://jsonplaceholder.typicode.com/comments');
    const data = await result.json();

    let filteredData = data;

    if (queryString && queryString.trim()) {
      if (queryField === 'multiple') {
        // Parse the queryString JSON
        let filters = {};
        try {
          filters = JSON.parse(queryString);
        } catch (e) {
          console.error('Invalid JSON in queryString:', queryString);
        }

        filteredData = data.filter((item) =>
          Object.entries(filters).every(([key, val]) => {
            if (!val?.trim()) return true;
            const itemVal = String(item[key] ?? '').toLowerCase();
            return itemVal.includes(String(val).toLowerCase());
          })
        );

      } else if (queryField === 'all') {
        const search = queryString.toLowerCase();
        filteredData = data.filter((item) =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(search)
          )
        );
      } else {
        const search = queryString.toLowerCase();
        filteredData = data.filter((item) => {
          const fieldVal = item[queryField];
          return fieldVal && String(fieldVal).toLowerCase().includes(search);
        });
      }
    }

    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit);
    // filter the key and length
    // Count how many times each key appears
    const keyCountMap = {};

    paginatedData.forEach(obj => {
      Object.keys(obj).forEach(key => {
        keyCountMap[key] = (keyCountMap[key] || 0) + 1;
      });
    });
    const uniqueKeys = Object.keys(keyCountMap);
    return {
      total: filteredData.length,
      data: paginatedData,
      uniqueKeys,
      keyCountMap
    };

  } catch (err) {
    console.log('Something went wrong:', err);
    return { total: 0, data: [] };
  }
};

app.get('/', async (req, res) => {
  try {
    const data = await fetchData();
    res.json({ data });
  } catch (err) {
    res.status(500).send('Error occurred while fetching data');
  }
});

app.post('/serverside', async (req, res) => {
  console.log('req.body', req.body)
  try {
    const { data, total,  uniqueKeys, keyCountMap } = await fetchData2(req.body);
    setTimeout(() => {
      res.json({ data, total,  uniqueKeys, keyCountMap });
    }, 1000);
  } catch (err) {
    res.status(500).send('Error occurred while fetching data');
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


