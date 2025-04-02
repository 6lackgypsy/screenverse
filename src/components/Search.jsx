const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div className="">
        <img src="/search.svg" alt="Search" />
        <input
          type="text"
          placeholder="Search through thousaands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}

export default Search
