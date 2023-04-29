﻿using System.Security.Cryptography;
using System.Text;
using API.Models.Paging;
using API.Models.Users;
using API.Repositories.DsoRepository;
using API.Repositories.ProsumerRepository;
using Microsoft.AspNetCore.Mvc;
using API.Repositories.UserRepository;
using API.Models.HelpModels;
using System.Diagnostics.Eventing.Reader;
using API.Services.Auth;
using System.Text.RegularExpressions;

namespace API.Services.DsoService
{
    public class DsoService : IDsoService
    {
        private readonly IUserRepository _repository;
        public DsoService(IUserRepository repository)
        {
            _repository = repository;
           
        }


       
        public async Task<bool> DeleteDsoWorker(string id)
        {
            try
            {
                await _repository.DeleteDsoWorker(id);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<Dso> GetDsoWorkerById(string id)
        {
            var dso = await _repository.GetDsoWorkerById(id);
            if (dso == null) throw new ArgumentException("No dso found with this id!");

            return dso;
        }

        public async Task<bool> EditDsoWorker(string id, DsoEdit newValues)
        {
            Dso dso;
            try
            {
                dso = await GetDsoWorkerById(id);
            }
            catch (Exception)
            {
                return false;       //ako ne moze da ga nadje, nije editovan
            }

            if (newValues.Email.Length > 0)
            {
                if (dso.Email.Equals(newValues.Email) || await checkEmail(newValues.Email))
                    dso.Email = newValues.Email;
                else
                    return false;
            }

            //sifra
            if (newValues.Password.Length > 0)
            {
                var hmac = new HMACSHA512();
                byte[] passwordSalt = hmac.Key;
                byte[] passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(newValues.Password));
                dso.SaltPassword = passwordSalt;
                dso.HashPassword = passwordHash;
            }

            if (newValues.FirstName.Length > 0) dso.FirstName = newValues.FirstName;
            if (newValues.LastName.Length > 0) dso.LastName = newValues.LastName;
            if (newValues.Salary > 0) dso.Salary = newValues.Salary;

            var roles = await GetRoleIds();
            var regions = await GetRegionIds();
            if (roles.Contains(newValues.RoleId)) dso.RoleId = newValues.RoleId;
            if (regions.Contains(newValues.RegionId)) dso.RegionId = newValues.RegionId;

            try
            {
                await _repository.Save();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<long>> GetRoleIds()
        {
            var roles = await _repository.GetRoleIds();
            if (roles == null) throw new ArgumentException("No roles in database!");

            return roles;
            
        }

        public async Task<List<string>> GetRegionIds()
        {
            var regions = await _repository.GetRegionIds();
            if (regions == null) throw new ArgumentException("No regions in database!");

            return regions;

        }

        public async Task<List<Dso>> GetAllDsos()
        {
            var dsos = await _repository.GetAllDsos();
            if (dsos == null) throw new ArgumentException("No dsos in database!");

            return dsos;
        }

        public async Task<List<string>> getEmails()
        {
            List<string> emails = new List<string>();
            var users = await _repository.GetAllProsumers();
            foreach (var user in users)
                emails.Add(user.Email);
            var dsos = await _repository.GetAllDsos();
            foreach (var dso in dsos)
                emails.Add(dso.Email);

            return emails;
        }

        public async Task<bool> checkEmail(string email)
        {
            var emails = await getEmails();
            foreach (var e in emails)
                if (e.Equals(email))
                    return false;

            return true;
        }
        public async Task<List<string>> getUsername()
        {
            List<string> username = new List<string>();
            var users = await _repository.GetAllProsumers();
            foreach (var user in users)
                username.Add(user.Username);
            var dsos = await _repository.GetAllDsos();
            foreach (var dso in dsos)
                username.Add(dso.Email);

            return username;
        }

        public async Task<bool> checkUsername(string username)
        {
            var usernames = await getUsername();
            foreach (var un in usernames)
                if (un.Equals(username))
                    return false;

            return true;
        }

        public Task<PagedList<Dso>> GetDsoWorkers(DsoWorkerParameters dsoWorkersParameters) // paging
        {
            return  _repository.GetDsoWorkers(dsoWorkersParameters);
        }

        public async Task<List<Dso>> GetDsoWorkersByRegionId(string RegionID)
        {
            var dsoWorkers = await _repository.GetDsoWorkersByRegionId(RegionID);
            if (dsoWorkers == null) throw new ArgumentException("No found worker for this Region!");

            return dsoWorkers;
        }
        public async Task<List<Dso>> GetWorkersbyRoleId(long RoleID)
        {
            var dsoWorkers = await _repository.GetWorkersbyRoleId(RoleID);
            if (dsoWorkers == null) throw new ArgumentException("No found worker for this Role!");

            return dsoWorkers;
        }
        public async Task<IEnumerable<Dso>> GetWorkerByFilter(string RegionID, long RoleID)
        {
            var dsoWorkers = await _repository.GetWorkerByFilter(RegionID, RoleID);
            if (dsoWorkers == null) throw new ArgumentException("No found worker for this Role and this Region!");

            return dsoWorkers;

        }
        public async Task<List<Role>> GetRoles()
        {
            var roles = await _repository.GetRoles();
            if (roles == null) throw new ArgumentException("No roles in database!");
            return roles;
        }
        public async Task<List<Region>> GetRegions()
        {
            var regions = await _repository.GetRegions();
            if (regions == null) throw new ArgumentException("No regions in database!");
            return regions;
        }

        public async Task<string> GetRoleName(long id)
        {
            var roleName = await _repository.getRoleName(id);
            if (roleName == null) throw new ArgumentException("No role for that id!");
            return roleName;
        }

        public async Task<string> GetRegionName(string id)
        {
            var roleName = await _repository.GetRegionName(id);
            if (roleName == null) throw new ArgumentException("No region for that id!");
            return roleName;
        }
       
        public Boolean IsValidEmail(string email)
        {
            Regex emailRegex = new Regex(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$", RegexOptions.IgnoreCase);

            return emailRegex.IsMatch(email);
        }

        public async Task<Prosumer> UpdateProsumerByDso(ChangeProsumerbyDSO change)
        {

            Prosumer prosumer = await _repository.UpdateProsumerByDso(change);
            if (prosumer == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(change.Username))
            {
                prosumer.Username = change.Username;
            }

            if (!string.IsNullOrEmpty(change.Email))
            {
                prosumer.Email = change.Email;
            }

            if (!string.IsNullOrEmpty(change.FirstName))
            {
                prosumer.FirstName = change.FirstName;
            }

            if (!string.IsNullOrEmpty(change.LastName))
            {
                prosumer.LastName = change.LastName;
            }

            if (!string.IsNullOrEmpty(change.CityName))
            {
                City city = await _repository.getCity(change.CityName);
                prosumer.CityId = city.Id;
            }

            if (!string.IsNullOrEmpty(change.NeigborhoodName))
            {

                Neigborhood neigh = await _repository.getNeigborhood(change.NeigborhoodName);
                prosumer.NeigborhoodId = neigh.Id;
            }

            if (!string.IsNullOrEmpty(change.Latitude))
            {
                prosumer.Latitude = change.Latitude;
            }

            if (!string.IsNullOrEmpty(change.Longitude))
            {
                prosumer.Longitude = change.Longitude;
            }

            if (!string.IsNullOrEmpty(change.Address))
            {
                prosumer.Address = change.Address;
            }

            prosumer.DateCreate = DateTime.Now.ToString("MM/dd/yyyy");
            await _repository.Save();
            return prosumer;

        }

        public async Task<double> ProsumerCount()
        {
            return (await _repository.GetAllProsumers()).Count();
        }

        public async Task<List<ElectricityPrice>> Prices()
        {
            var prices = await _repository.Prices();
            if (prices == null) throw new ArgumentException("No prices!");
            return prices;
        }

        public async Task<Dictionary<string, double>> CurrentPrice()
        {
            var price = await _repository.GetPrice(DateTime.Now);
            var yesterday = await _repository.GetPrice(DateTime.Now.AddDays(-1));
            var percentage = (100 * price / yesterday) - 100;

            if (price == null) throw new ArgumentException("No price!");
            
            return new Dictionary<string, double> {
                { "Price", price },
                { "Percentage", Math.Round(percentage, 2) }
            };
        }
        public async Task<bool> DeleteImage(String WorkerID)
        {
            bool answer = await _repository.DeleteImageDso(WorkerID);
            if (answer == null) throw new ArgumentException("ERORR DeleteImage");
            return answer;
        }

        public async Task<(String, Boolean)> SaveImage(String WorkerID, IFormFile imageFile)
        {
            (String, Boolean) answer = await _repository.SaveImageDso(WorkerID, imageFile);
            if (answer.Item2 == false) throw new ArgumentException(answer.Item1);

            return answer;
        }
    }
}
