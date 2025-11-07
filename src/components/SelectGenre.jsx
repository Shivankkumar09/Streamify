import { useDispatch } from "react-redux";
import styled from "styled-components";
import { fetchDataByGenre } from "../store";
import { MdOutlineFilterList } from "react-icons/md";
import { BiChevronDown } from "react-icons/bi";

export default function SelectGenre({ genres, type }) {
  const dispatch = useDispatch();
  
  return (
    <Container>
      <FilterWrapper>
        <FilterIcon>
          <MdOutlineFilterList />
        </FilterIcon>
        <FilterLabel>Genre:</FilterLabel>
        <SelectWrapper>
          <Select
            onChange={(e) => {
              dispatch(
                fetchDataByGenre({
                  genres,
                  genre: e.target.value,
                  type,
                })
              );
            }}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => {
              return (
                <option value={genre.id} key={genre.id}>
                  {genre.name}
                </option>
              );
            })}
          </Select>
          <DropdownIcon>
            <BiChevronDown />
          </DropdownIcon>
        </SelectWrapper>
      </FilterWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  
  @media (max-width: 968px) {
    justify-content: flex-start;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%);
  padding: 1.2rem 1.8rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  width: fit-content;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(229, 9, 20, 0.5);
    box-shadow: 0 6px 12px rgba(229, 9, 20, 0.2);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 1.5rem;
  }
`;

const FilterIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e50914;
  font-size: 1.8rem;
  
  svg {
    filter: drop-shadow(0 2px 4px rgba(229, 9, 20, 0.5));
  }
`;

const FilterLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #e5e5e5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Select = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 0.8rem 3rem 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  min-width: 180px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: #e50914;
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }
  
  option {
    background-color: #181818;
    color: white;
    padding: 0.8rem;
    font-size: 1rem;
    
    &:hover {
      background-color: #282828;
    }
  }
  
  @media (max-width: 768px) {
    min-width: 140px;
    font-size: 1rem;
    padding: 0.7rem 2.5rem 0.7rem 1.2rem;
  }
`;

const DropdownIcon = styled.div`
  position: absolute;
  right: 0.8rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  transition: all 0.3s ease;
  
  ${Select}:hover + & {
    color: white;
  }
  
  ${Select}:focus + & {
    color: #e50914;
  }
`;